// Güven Şahin - guvensahin.com
function updateTotalsFromStorage(storageObj)
{
    if (!storageObj) {
        return;
    }

    if (storageObj.sumOfToday) {
        document.getElementById('sumOfToday').innerHTML     = '<a href="' + storageObj.redmineUrl + '/time_entries?user_id=me&spent_on=t" target="blank">' + storageObj.sumOfToday.toString() + ' Hours</a>';
    }

    if (storageObj.sumOfYesterday) {
        document.getElementById('sumOfYesterday').innerHTML = '<a href="' + storageObj.redmineUrl + '/time_entries?user_id=me&spent_on=ld" target="blank">' + storageObj.sumOfYesterday.toString() + ' Hours</a>';
    }

    if (storageObj.sumOfWeek) {
        document.getElementById('sumOfWeek').innerHTML      = '<a href="' + storageObj.redmineUrl + '/time_entries?user_id=me&spent_on=w" target="blank">' + storageObj.sumOfWeek.toString() + ' Hours</a>';

        if (storageObj.workingHour && storageObj.workingHour > 0) {
            document.getElementById('personDayWeek').innerHTML = (storageObj.sumOfWeek / storageObj.workingHour).toFixed(2).toString() + ' <abbr title="Person-Day based on your working hour">P/D</abbr>';
        }
    }

    if (storageObj.sumOfMonth) {
        document.getElementById('sumOfMonth').innerHTML     = '<a href="' + storageObj.redmineUrl + '/time_entries?user_id=me&spent_on=m" target="blank">' + storageObj.sumOfMonth.toString() + ' Hours</a>';

        if (storageObj.workingHour && storageObj.workingHour > 0) {
            document.getElementById('personDayMonth').innerHTML = (storageObj.sumOfMonth / storageObj.workingHour).toFixed(2).toString() + ' <abbr title="Person-Day based on your working hour">P/D</abbr>';
        }
    }
}


chrome.storage.sync.get(null, function (storageObj) {

    // first show saved totals to user
    updateTotalsFromStorage(storageObj);

    
    // then check updated data silently by async call
    var apiUrl = generateApiUrl(storageObj);
    if (!apiUrl) {
        return;
    }

    fetch(apiUrl)
    .then(function(response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
        }
        
        response.json().then(function(data) {
        
            var handler = handleData(data);

            // save data
            chrome.storage.sync.set({ 
                sumOfToday      : handler.sumOfToday,
                sumOfYesterday  : handler.sumOfYesterday,
                sumOfWeek       : handler.sumOfWeek,
                sumOfMonth      : handler.sumOfMonth,
            });

            // refresh badge
            chrome.action.setBadgeText({ text: handler.sumOfToday.toString() });


            // update totals again with the new values
            updateTotalsFromStorage(storageObj);

            // show today's time entries
            if (handler.todayEntries
                && handler.todayEntries.length > 0)
            {
                var elCardGroup = document.querySelector('.card-group');

                handler.todayEntries.forEach(function(item) {
                    
                    var urlEdit = storageObj.redmineUrl + "/time_entries/" + item.id + "/edit";
                    var urlProject = storageObj.redmineUrl + "/projects/" + item.project.id;
        
                    elCardGroup.innerHTML += `
                            <div class="card">
                                <div class="card-body">
                                    <p class="card-text">${item.comments}</p>
                                    <a href="${urlEdit}" class="card-link" target="blank">${item.hours} Hours</a>
                                    <a href="${urlProject}" class="card-link" target="blank">${item.project.name}</a>
                                </div>
                            </div>`;
                });
            }
        });
    })
    .catch(function(err) {
        console.log('Fetch Error :-S', err);
    });
});