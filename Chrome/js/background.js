// Güven Şahin - guvensahin.com
document.addEventListener('DOMContentLoaded', function () {
    refreshContent();
});

// check every 2 minutes
setInterval(function () {
    refreshContent();    
}, 2 * 60 * 1000);