// Güven Şahin - guvensahin.com
Date.prototype.isToday = function () {
    const date = new Date();
    
    return this.getDate() === date.getDate() &&
        this.getMonth() === date.getMonth() &&
        this.getFullYear() === date.getFullYear();
};

Date.prototype.isYesterday = function () {
    var date = new Date();
    date.setDate(date.getDate() - 1);

    return this.getDate() === date.getDate() &&
        this.getMonth() === date.getMonth() &&
        this.getFullYear() === date.getFullYear();
};

function getWeekNumber(d)
{
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    // Return array of year and week number
    return weekNo;
}

function generateApiUrl(storageObj)
{
    var ret = null;

    if (storageObj.redmineUrl
        && storageObj.redmineApiKey)
    {
        ret = storageObj.redmineUrl + '/time_entries.json?key=' + storageObj.redmineApiKey + '&user_id=me&limit=100&spent_on=m';
    }

    return ret;
};


function handleData(data)
{
    // handle data
    var sumOfToday = 0.0;
    var sumOfYesterday = 0.0;
    var sumOfWeek = 0.0;
    var sumOfMonth = 0.0;
    var arrTodayEntries = [];

    const currentWeek = getWeekNumber(new Date());

    $.each(data.time_entries, function (index, item)
    {
        var itemDateObj = new Date(Date.parse(item.spent_on));

        // today
        if (itemDateObj.isToday())
        {
            sumOfToday += item.hours;
            arrTodayEntries.push(item);
        }
        // yesterday
        else if (itemDateObj.isYesterday())
        {
            sumOfYesterday += item.hours;
        }

        // this week
        if (currentWeek == getWeekNumber(itemDateObj))
        {
            sumOfWeek += item.hours;
        }

        // this month
        sumOfMonth += item.hours;
    });

    return {
        sumOfToday: sumOfToday,
        sumOfYesterday: sumOfYesterday,
        sumOfWeek: sumOfWeek,
        sumOfMonth: sumOfMonth,
        todayEntries: arrTodayEntries
    };
}

function updateTotalsFromStorage(storageObj)
{
    document.getElementById('sumOfToday').innerHTML     = '<a href="' + storageObj.redmineUrl + '/time_entries?user_id=me&spent_on=t" target="blank">' + storageObj.sumOfToday.toString() + ' Hours</a>';
    document.getElementById('sumOfYesterday').innerHTML = '<a href="' + storageObj.redmineUrl + '/time_entries?user_id=me&spent_on=ld" target="blank">' + storageObj.sumOfYesterday.toString() + ' Hours</a>';
    document.getElementById('sumOfWeek').innerHTML      = '<a href="' + storageObj.redmineUrl + '/time_entries?user_id=me&spent_on=w" target="blank">' + storageObj.sumOfWeek.toString() + ' Hours</a>';
    document.getElementById('sumOfMonth').innerHTML     = '<a href="' + storageObj.redmineUrl + '/time_entries?user_id=me&spent_on=m" target="blank">' + storageObj.sumOfMonth.toString() + ' Hours</a>';

    if (storageObj.workingHour
        && storageObj.workingHour > 0)
    {
        document.getElementById('personDayWeek').innerHTML = (storageObj.sumOfWeek / storageObj.workingHour).toFixed(2).toString() + ' <abbr title="Person-Day based on your working hour">P/D</abbr>';
        document.getElementById('personDayMonth').innerHTML = (storageObj.sumOfMonth / storageObj.workingHour).toFixed(2).toString() + ' <abbr title="Person-Day based on your working hour">P/D</abbr>';
    }
}


function refreshContent()
{
    chrome.storage.sync.get(null, function (storageObj) {

        var apiUrl = generateApiUrl(storageObj);
        if (!apiUrl) {
            return;
        }
            
        $.ajax({
            url: apiUrl,
            type: 'get',
            dataType: 'json',
            success: function (data) {

                var handler = handleData(data);

                // save data
                chrome.storage.sync.set({ 
                    sumOfToday      : handler.sumOfToday,
                    sumOfYesterday  : handler.sumOfYesterday,
                    sumOfWeek       : handler.sumOfWeek,
                    sumOfMonth      : handler.sumOfMonth,
                });

                // refresh badge
                chrome.browserAction.setBadgeText({ text: handler.sumOfToday.toString() });
            }
        });
    });
};


function refreshPopup()
{
    chrome.storage.sync.get(null, function (storageObj) {

        // first show saved totals to user
        updateTotalsFromStorage(storageObj);

        
        // then check updated data silently by async call
        var apiUrl = generateApiUrl(storageObj);
        if (!apiUrl) {
            return;
        }
            
        $.ajax({
            url: apiUrl,
            type: 'get',
            dataType: 'json',
            success: function (data) {

                var handler = handleData(data); 

                // save data
                chrome.storage.sync.set({ 
                    sumOfToday      : handler.sumOfToday,
                    sumOfYesterday  : handler.sumOfYesterday,
                    sumOfWeek       : handler.sumOfWeek,
                    sumOfMonth      : handler.sumOfMonth,
                });

                // refresh badge
                chrome.browserAction.setBadgeText({ text: handler.sumOfToday.toString() });



                // update totals again with the new values
                updateTotalsFromStorage(storageObj);

                // show today's time entries
                if (handler.todayEntries
                    && handler.todayEntries.length > 0)
                {
                    var cardGroup = $('.card-group');

                    handler.todayEntries.forEach(function (item) {
                        
                        var urlEdit = storageObj.redmineUrl + "/time_entries/" + item.id + "/edit";
                        var urlProject = storageObj.redmineUrl + "/projects/" + item.project.id;
            
                        var content = `
                                <div class="card">
                                    <div class="card-body">
                                        <p class="card-text">${item.comments}</p>
                                        <a href="${urlEdit}" class="card-link" target="blank">${item.hours} Hours</a>
                                        <a href="${urlProject}" class="card-link" target="blank">${item.project.name}</a>
                                    </div>
                                </div>`;

                        cardGroup.append(content);
                    }); 
                }
            }
        });
    });
}