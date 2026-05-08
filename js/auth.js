// ==========================================
// XỬ LÝ ĐĂNG NHẬP & ĐĂNG XUẤT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const savedUser = localStorage.getItem('eduboxUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        loginScreen.classList.remove('hidden');
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    loginError.classList.add('hidden');
    setBtnLoading(btnLogin, true);

    try {
        const response = await fetch(`${SCRIPT_URL}?sheetName=Users`);
        const result = await response.json();
        
        if (result.status === 'success') {
            const users = result.data;
            const user = users.find(u => 
                String(u.ID).trim().toLowerCase() === email.toLowerCase() && 
                String(u.Password).trim() === password
            );
            
            if (user) {
                if(user.Status === 'Inactive') {
                    showLoginError("Tài khoản đã bị khóa!");
                } else {
                    currentUser = user;
                    localStorage.setItem('eduboxUser', JSON.stringify(user));
                    showDashboard();
                }
            } else {
                showLoginError("Sai email hoặc mật khẩu!");
            }
        } else {
            showLoginError("Lỗi hệ thống: " + result.message);
        }
    } catch (error) {
        showLoginError("Không thể kết nối máy chủ. Vui lòng thử lại!");
    } finally {
        setBtnLoading(btnLogin, false);
    }
});

btnLogout.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('eduboxUser');
    currentUser = null;
    dashboardScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    loginForm.reset();
});

function showLoginError(msg) {
    loginError.textContent = msg;
    loginError.classList.remove('hidden');
}

function setBtnLoading(btn, isLoading) {
    const loader = btn.querySelector('.loader');
    const text = btn.querySelector('.btn-text');
    btn.disabled = isLoading;
    if (isLoading) {
        loader.classList.remove('hidden');
        text.textContent = 'Đang xử lý...';
    } else {
        loader.classList.add('hidden');
        text.textContent = 'Đăng nhập';
    }
}
