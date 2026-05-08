// ==========================================
// HELPER FUNCTIONS (VALIDATION, FORMATTING)
// ==========================================

function showGlobalLoader(show) {
    if (show) globalLoader.classList.remove('hidden');
    else globalLoader.classList.add('hidden');
}

function openModal(html) {
    modalContainer.innerHTML = html;
    modalContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

window.closeModal = function() {
    modalContainer.classList.add('hidden');
    modalContainer.innerHTML = '';
    document.body.style.overflow = 'auto';
}

function formatDateForInput(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return date.toISOString().split('T')[0];
}

function validateEmail(email) {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
}

function validatePhone(phone) {
    return /(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/.test(phone);
}

function ensureLeadingZero(phone) {
    if (!phone) return "";
    let p = phone.toString().trim();
    if (p.length === 9 && !p.startsWith("0") && !p.startsWith("84")) {
        return "0" + p;
    }
    return p;
}
