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

function generateApiUrl(options)
{
    var ret = null;

    if (options
        && options.url
        && options.apiKey)
    {
        ret = options.url + '/time_entries.json?key=' + options.apiKey + '&user_id=me&limit=100&spent_on=m';
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

    data.time_entries.forEach(function(item) {
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

    var totals = {
        sumOfToday: sumOfToday,
        sumOfYesterday: sumOfYesterday,
        sumOfWeek: sumOfWeek,
        sumOfMonth: sumOfMonth,
    };

    return {
        totals: totals,
        todayEntries: arrTodayEntries
    };
}




function refreshContent()
{
    chrome.storage.sync.get(null, function (storageObj) {

        if (!storageObj.options) {
            return;
        }

        fetch(generateApiUrl(storageObj.options))
        .then(function(response) {
            
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }
            
            response.json().then(function(data) {
            
                var handler = handleData(data);

                // save data
                chrome.storage.sync.set({ totals: handler.totals });

                // refresh badge
                chrome.action.setBadgeText({ text: handler.totals.sumOfToday.toString() });
            });
        })
        .catch(function(err) {
            console.log('Fetch Error :-S', err);
        });
    });
};


