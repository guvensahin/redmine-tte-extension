// Güven Şahin - guvensahin.com
function saveOptions()
{
    var redmineUrl      = document.getElementById('redmineUrl').value;
    var redmineApiKey   = document.getElementById('redmineApiKey').value;
    var redmineUsername = document.getElementById('redmineUsername').value;
    var workingHour     = document.getElementById('workingHour').value;

    if (!redmineUrl
        || !redmineApiKey
        || !redmineUsername)
    {
        updateSaveStatus('Please fill all required fields.');
        return;
    }

    // connect to redmine, retrive user id.
    $.ajax({
        url: redmineUrl + '/users.json?key=' + redmineApiKey + '&name=' + redmineUsername,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            console.log(data);

            if (!data.users[0]
                || data.users[0].login != redmineUsername)
            {
                updateSaveStatus('Redmine Username not valid.');
                return;
            };

            var userId = data.users[0].id;
            console.log(userId);

            // chrome'a kaydedilir
            chrome.storage.sync.set({
                redmineUrl: redmineUrl,
                redmineApiKey: redmineApiKey,
                redmineUsername: redmineUsername,
                redmineUserId: userId,
                workingHour: workingHour
            }, function () {
                updateSaveStatus('Options saved.', true);
            });
        },
        error: function (xhr) {
            updateSaveStatus('Some fields are not valid.');
            console.log('Something went wrong. Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
        }
    });
}

function updateSaveStatus(message, isSuccess = false)
{
    var status = document.getElementById('status');

    var cssClass = isSuccess ? 'alert-success' : 'alert-warning';
    message = '<div id="status" class="alert ' + cssClass +'" role="alert">' + message + '</div>';

    status.innerHTML = message;

    if (isSuccess)
    {
        setTimeout(function () {
            status.innerHTML = '';
        }, 750);
    }
}

function restoreOptions()
{
    chrome.storage.sync.get(null, function (items)
    {
        if (items)
        {
            if (items.redmineUrl)
            {
                document.getElementById('redmineUrl').value = items.redmineUrl;
            }

            if (items.redmineApiKey)
            {
                document.getElementById('redmineApiKey').value = items.redmineApiKey;
            }

            if (items.redmineUsername)
            {
                document.getElementById('redmineUsername').value = items.redmineUsername;
            }

            if (items.workingHour)
            {
                document.getElementById('workingHour').value = items.workingHour;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);