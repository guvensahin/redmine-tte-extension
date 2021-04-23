// Güven Şahin - guvensahin.com
function saveOptions()
{
    var redmineUrl      = document.getElementById('redmineUrl').value;
    var redmineApiKey   = document.getElementById('redmineApiKey').value;
    var workingHour     = document.getElementById('workingHour').value;

    if (!redmineUrl
        || !redmineApiKey)
    {
        updateSaveStatus('Please fill all required fields.');
        return;
    }

    // save options
    chrome.storage.sync.set({
            redmineUrl: redmineUrl,
            redmineApiKey: redmineApiKey,
            workingHour: workingHour
        }, function () {
            updateSaveStatus('Options saved.', true);
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
    chrome.storage.sync.get(null, function (storage) {

        if (storage)
        {
            if (storage.redmineUrl)
            {
                document.getElementById('redmineUrl').value = storage.redmineUrl;
            }

            if (storage.redmineApiKey)
            {
                document.getElementById('redmineApiKey').value = storage.redmineApiKey;
            }

            if (storage.workingHour)
            {
                document.getElementById('workingHour').value = storage.workingHour;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);