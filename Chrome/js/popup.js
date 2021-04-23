// Güven Şahin - guvensahin.com

function updateTotalsFromStorage(options, totals)
{
    if (!options || !totals) {
        return;
    }

    if (totals.sumOfToday == 0 || totals.sumOfToday) {
        document.getElementById('sumOfToday').innerHTML = '<a href="' + options.url + '/time_entries?user_id=me&spent_on=t" target="blank">' + totals.sumOfToday.toString() + 'h';
    }

    if (totals.sumOfYesterday == 0 || totals.sumOfYesterday) {
        document.getElementById('sumOfYesterday').innerHTML = '<a href="' + options.url + '/time_entries?user_id=me&spent_on=ld" target="blank">' + totals.sumOfYesterday.toString() + 'h';
    }

    if (totals.sumOfWeek == 0 || totals.sumOfWeek) {
        document.getElementById('sumOfWeek').innerHTML = '<a href="' + options.url + '/time_entries?user_id=me&spent_on=w" target="blank">' + totals.sumOfWeek.toString() + 'h';

        if (options.workingHours && options.workingHours > 0) {
            document.getElementById('personDayWeek').innerHTML = (totals.sumOfWeek / options.workingHours).toFixed(2).toString();
        }
    }

    if (totals.sumOfMonth == 0 || totals.sumOfMonth) {
        document.getElementById('sumOfMonth').innerHTML = '<a href="' + options.url + '/time_entries?user_id=me&spent_on=m" target="blank">' + totals.sumOfMonth.toString() + 'h';

        if (options.workingHours && options.workingHours > 0) {
            document.getElementById('personDayMonth').innerHTML = (totals.sumOfMonth / options.workingHours).toFixed(2).toString();
        }
    }
}

function handleError(message)
{
    document.querySelector('#spinner').classList.add('d-none');
    document.querySelector('#section-content').classList.remove('d-none');
    document.querySelector('.list-group').classList.add('d-none');
    
    var elem = document.querySelector('#alert-error');
    elem.classList.remove('d-none');
    elem.innerHTML = message;
}

chrome.storage.sync.get(null, function (storageObj) {

    if (!storageObj.options) {
        document.querySelector('#section-no-options').classList.remove('d-none');
        document.querySelector('#section-top').classList.add('d-none');
        document.querySelector('#spinner').classList.add('d-none');
        return;
    }

    // first show saved totals to user
    if (storageObj.totals) {
        updateTotalsFromStorage(storageObj.options, storageObj.totals);
    }
    
    // check updated data silently by async call
    fetch(generateApiUrl(storageObj.options))
    .then(function(response) {
        
        if (response.status !== 200) {
            
            var message = 'Cannot connect redmine portal. Status Code: ' + response.status; 
            console.log(message);
            handleError(message);
            return;
        }
        
        response.json().then(function(data) {
        
            var handler = handleData(data);

            // save data
            chrome.storage.sync.set({ totals: handler.totals });

            // refresh badge
            chrome.action.setBadgeText({ text: handler.totals.sumOfToday.toString() });


            // update totals with the new values
            updateTotalsFromStorage(storageObj.options, handler.totals);

            // show time entry list
            if (handler.todayEntries
                && handler.todayEntries.length > 0)
            {
                var elemList = document.querySelector('.list-group');

                handler.todayEntries.forEach(function(item) {
                    
                    var urlEdit = storageObj.options.url + "/time_entries/" + item.id + "/edit";
        
                    elemList.innerHTML += `
                            <a href="${urlEdit}" target="blank" class="list-group-item list-group-item-action">
                                <div class="d-flex w-100 justify-content-between">
                                    <small class="text-muted">${item.project.name}</small>
                                    <small class="text-muted">${item.hours} Hours</small>
                                </div>
                                <p class="mb-1">${item.comments}</p>
                            </a>`;
                });
            }
            else
            {
                document.querySelector('.list-group').classList.add('d-none');
                document.querySelector('#alert-no-entry').classList.remove('d-none');
            }
            

            // delete spinner and show content
            document.querySelector('#spinner').classList.add('d-none');
            document.querySelector('#section-content').classList.remove('d-none');
        });
    })
    .catch(function(err) {
        console.log('Fetch error', err);
        handleError('Something went wrong! Please check the values you entered in the options.');
    });
});