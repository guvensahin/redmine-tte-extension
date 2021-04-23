// Güven Şahin - guvensahin.com

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


function saveOptions()
{
    var redmineUrl      = document.getElementById('redmineUrl').value;
    var redmineApiKey   = document.getElementById('redmineApiKey').value;
    var workingHours    = document.getElementById('workingHours').value;

    if (!redmineUrl
        || !redmineApiKey)
    {
        updateSaveStatus('Please fill all required fields.');
        return;
    }

    // save options
    var options = {
        url: redmineUrl,
        apiKey: redmineApiKey,
        workingHours: workingHours
    };

    chrome.storage.sync.set({ options: options },
        function () {
            updateSaveStatus('Options saved.', true);
        });
}



function restoreOptions()
{
    chrome.storage.sync.get(null, function (storageObj) {

        if (storageObj.options)
        {
            if (storageObj.options.url)
            {
                document.getElementById('redmineUrl').value = storageObj.options.url;
            }

            if (storageObj.options.apiKey)
            {
                document.getElementById('redmineApiKey').value = storageObj.options.apiKey;
            }

            if (storageObj.options.workingHours)
            {
                document.getElementById('workingHours').value = storageObj.options.workingHours;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);