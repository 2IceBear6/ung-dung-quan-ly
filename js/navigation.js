// ==========================================
// ĐIỀU HƯỚNG TRANG (SPA NAVIGATION)
// ==========================================

function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    
    userNameDisplay.textContent = currentUser.ID.split('@')[0];
    userRoleDisplay.textContent = currentUser.Role;
    
    renderMenu(currentUser.Role);
    renderWelcomePage();
}

function renderMenu(role) {
    let menuHtml = '';
    
    if (role === 'Admin') {
        menuHtml = `
            <a href="#" class="nav-item active" onclick="navigate('welcome')"><i class="fa-solid fa-house"></i> Tổng quan</a>
            <a href="#" class="nav-item" onclick="navigate('students')"><i class="fa-solid fa-users"></i> Học viên</a>
            <a href="#" class="nav-item" onclick="navigate('teachers')"><i class="fa-solid fa-chalkboard-user"></i> Giáo viên</a>
            <a href="#" class="nav-item" onclick="navigate('courses')"><i class="fa-solid fa-book"></i> Khóa học</a>
            <a href="#" class="nav-item" onclick="navigate('classes')"><i class="fa-solid fa-school"></i> Lớp học</a>
            <a href="#" class="nav-item" onclick="navigate('schedules')"><i class="fa-regular fa-calendar-days"></i> Lịch học</a>
            <a href="#" class="nav-item" onclick="navigate('payments')"><i class="fa-solid fa-money-bill-wave"></i> Học phí</a>
            <a href="#" class="nav-item" onclick="navigate('reports')"><i class="fa-solid fa-chart-pie"></i> Báo cáo</a>
        `;
    } else if (role === 'Teacher') {
        menuHtml = `
            <a href="#" class="nav-item active" onclick="navigate('welcome')"><i class="fa-solid fa-house"></i> Tổng quan</a>
            <a href="#" class="nav-item" onclick="navigate('my-schedules')"><i class="fa-regular fa-calendar-days"></i> Lịch dạy</a>
            <a href="#" class="nav-item" onclick="navigate('attendance')"><i class="fa-solid fa-clipboard-user"></i> Điểm danh</a>
            <a href="#" class="nav-item" onclick="navigate('grading')"><i class="fa-solid fa-star"></i> Nhập điểm</a>
        `;
    } else if (role === 'Student') {
        menuHtml = `
            <a href="#" class="nav-item active" onclick="navigate('welcome')"><i class="fa-solid fa-house"></i> Tổng quan</a>
            <a href="#" class="nav-item" onclick="navigate('my-classes')"><i class="fa-regular fa-calendar-days"></i> Lịch học</a>
            <a href="#" class="nav-item" onclick="navigate('my-grades')"><i class="fa-solid fa-star"></i> Bảng điểm</a>
            <a href="#" class="nav-item" onclick="navigate('my-payments')"><i class="fa-solid fa-money-bill-wave"></i> Học phí</a>
        `;
    }
    
    sidebarNav.innerHTML = menuHtml;
}

window.navigate = function(pageId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    if (pageId === 'welcome') {
        renderWelcomePage();
    } else if (pageId === 'students') {
        renderStudentsPage();
    } else if (pageId === 'teachers') {
        renderTeachersPage();
    } else if (pageId === 'courses') {
        renderCoursesPage();
    } else if (pageId === 'classes') {
        renderClassesPage();
    } else if (pageId === 'schedules') {
        renderSchedulesPage();
    } else {
        pageTitle.textContent = "Đang phát triển";
        contentArea.innerHTML = `
            <div class="card" style="text-align: center; padding: 3rem;">
                <i class="fa-solid fa-person-digging" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--gray-600)">Tính năng đang được phát triển...</h3>
            </div>
        `;
    }
}

function renderWelcomePage() {
    pageTitle.textContent = "Tổng quan";
    contentArea.innerHTML = `
        <div class="card" style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(16, 185, 129, 0.1)); border-left: 5px solid var(--primary);">
            <h3 style="color: var(--primary); margin-bottom: 0.5rem; font-size: 1.5rem;">Xin chào, ${currentUser.Role}!</h3>
            <p style="color: var(--gray-600)">Chào mừng bạn đến với Hệ thống quản lý trung tâm Anh ngữ EduBox.</p>
            <p style="margin-top: 1rem;"><strong>Dự án đã được tái cấu trúc thành công theo Rule 6!</strong> Mã nguồn hiện đã được chia nhỏ thành các module chuyên biệt để bạn dễ dàng quản lý.</p>
        </div>
    `;
}
