function showToast(message, type = "success") {
    var toast = $('<div class="toast ' + type + '">' + message + '</div>');
    $('body').append(toast);

    setTimeout(() => toast.addClass('show'), 100); // animate in
    setTimeout(() => {
        toast.removeClass('show');
        setTimeout(() => toast.remove(), 400); // remove after fade out
    }, 2500); // visible for 2.5s
}
