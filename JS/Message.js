async function getPublicIp() {
    try {
        const resp = await fetch('https://api.ipify.org?format=json');
        if (!resp.ok) throw new Error('ip service not available');
        const data = await resp.json();
        return data.ip; // string like "203.0.113.5"
    } catch (err) {
        //console.warn('Could not fetch public IP:', err);
        return null;
    }
}


function showToast(message, type = "success") {
    var toast = $('<div class="toast ' + type + '">' + message + '</div>');
    $('body').append(toast);

    setTimeout(() => toast.addClass('show'), 100); // animate in
    setTimeout(() => {
        toast.removeClass('show');
        setTimeout(() => toast.remove(), 400); // remove after fade out
    }, 2500); // visible for 2.5s
}


function showLoader() {
    console.log("Show loader");
    $("#globalLoader").fadeIn(200);
}

function hideLoader() {
    $("#globalLoader").fadeOut(200);
}
