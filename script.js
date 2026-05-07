// ==========================================
// CẤU HÌNH API
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxfImM03Y1eDubvgCCBoIz2KU8TQ5k75hcStLkv6PVKJM-IyfGfoVSSjiBDuVmgfIqnkw/exec"; 

// ==========================================
// DOM ELEMENTS
// ==========================================
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const globalLoader = document.getElementById('globalLoader');
const modalContainer = document.getElementById('modalContainer');

const userNameDisplay = document.getElementById('userNameDisplay');
const userRoleDisplay = document.getElementById('userRoleDisplay');
const sidebarNav = document.getElementById('sidebarNav');
const contentArea = document.getElementById('contentArea');
const pageTitle = document.getElementById('pageTitle');

// ==========================================
// TRẠNG THÁI ỨNG DỤNG
// ==========================================
let currentUser = null;

// ==========================================
// KHỞI TẠO (On Load)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Kiểm tra xem đã đăng nhập chưa
    const savedUser = localStorage.getItem('eduboxUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        loginScreen.classList.remove('hidden');
    }
});

// ==========================================
// XỬ LÝ ĐĂNG NHẬP
// ==========================================
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    loginError.classList.add('hidden');
    setBtnLoading(btnLogin, true);

    try {
        // Lấy danh sách Users từ Database
        const response = await fetch(`${SCRIPT_URL}?sheetName=Users`);
        const result = await response.json();
        
        if (result.status === 'success') {
            const users = result.data;
            // Tìm user khớp email và pass (xử lý trường hợp pass là số trong Google Sheets)
            const user = users.find(u => 
                String(u.ID).trim().toLowerCase() === email.toLowerCase() && 
                String(u.Password).trim() === password
            );
            
            if (user) {
                if(user.Status === 'Inactive') {
                    showLoginError("Tài khoản đã bị khóa!");
                } else {
                    // Đăng nhập thành công
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

// ==========================================
// HELPER FUNCTIONS (MODAL & LOADER)
// ==========================================
function showGlobalLoader(show) {
    if (show) globalLoader.classList.remove('hidden');
    else globalLoader.classList.add('hidden');
}

function openModal(html) {
    modalContainer.innerHTML = html;
    modalContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Chặn scroll khi mở modal
}

window.closeModal = function() {
    modalContainer.classList.add('hidden');
    modalContainer.innerHTML = '';
    document.body.style.overflow = 'auto';
}

// Chỉnh sửa định dạng ngày cho thẻ input type="date"
function formatDateForInput(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return date.toISOString().split('T')[0];
}

// ==========================================
// RENDER DASHBOARD DỰA TRÊN ROLE
// ==========================================
function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    
    // Cập nhật thông tin user
    userNameDisplay.textContent = currentUser.ID.split('@')[0]; // Lấy phần trước @ làm tên tạm
    userRoleDisplay.textContent = currentUser.Role;
    
    // Render Menu dựa trên Role
    renderMenu(currentUser.Role);
    
    // Render trang mặc định
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

// ==========================================
// ĐIỀU HƯỚNG TRANG (SPA)
// ==========================================
window.navigate = function(pageId) {
    // Cập nhật CSS menu active
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    if (pageId === 'welcome') {
        renderWelcomePage();
    } else if (pageId === 'students') {
        renderStudentsPage();
    } else {
        // Trang chưa phát triển
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
            <p style="margin-top: 1rem;"><strong>Luồng đăng nhập và phân quyền (Flow 1) đã hoạt động xuất sắc!</strong> Dựa vào Role của bạn, menu bên trái đã được tùy biến tự động.</p>
        </div>
    `;
}

// ==========================================
// QUẢN LÝ HỌC VIÊN (CRUD)
// ==========================================
async function renderStudentsPage() {
    pageTitle.textContent = "Quản lý Học viên";
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Danh sách học viên</h3>
                <button class="btn-primary" onclick="showStudentModal()"><i class="fa-solid fa-plus"></i> Thêm mới</button>
            </div>
            <div class="table-responsive">
                <table id="studentsTable">
                    <thead>
                        <tr>
                            <th>Mã HV</th>
                            <th>Họ và Tên</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Trình độ</th>
                            <th style="width: 100px;">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="studentsTableBody">
                        <tr><td colspan="6" style="text-align:center;">Đang tải dữ liệu...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    try {
        const response = await fetch(`${SCRIPT_URL}?sheetName=Students`);
        const result = await response.json();
        const tbody = document.getElementById('studentsTableBody');
        
        if (result.status === 'success') {
            const students = result.data;
            if (students.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Chưa có học viên nào trong Database</td></tr>`;
                return;
            }
            
            // Lưu data vào window để dùng cho việc edit
            window.allStudentsData = students;

            tbody.innerHTML = students.map(s => `
                <tr>
                    <td><span class="badge badge-success">${s.StudentID || 'N/A'}</span></td>
                    <td><strong>${s.FullName}</strong></td>
                    <td>${s.Email}</td>
                    <td>${s.Phone}</td>
                    <td>${s.Level}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit" title="Sửa" onclick="showStudentModal('${s.StudentID}')"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-delete" title="Xóa" onclick="deleteStudent('${s.StudentID}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) {
        document.getElementById('studentsTableBody').innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Lỗi tải dữ liệu</td></tr>`;
    }
}

// Hiển thị Modal Thêm/Sửa Học viên
window.showStudentModal = function(studentId = null) {
    let student = null;
    let title = "Thêm học viên mới";
    
    if (studentId) {
        student = window.allStudentsData.find(s => s.StudentID === studentId);
        title = "Chỉnh sửa học viên";
    }

    const html = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="btn-icon" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form id="studentForm">
                <div class="modal-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Mã học viên (StudentID)</label>
                            <input type="text" id="m_StudentID" value="${student ? student.StudentID : ''}" placeholder="HV001" ${student ? 'readonly' : 'required'} style="background: ${student ? '#f8fafc' : 'white'}">
                        </div>
                        <div class="form-group">
                            <label>Họ và Tên</label>
                            <input type="text" id="m_FullName" value="${student ? student.FullName : ''}" placeholder="Nguyễn Văn A" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="m_Email" value="${student ? student.Email : ''}" placeholder="email@example.com" required>
                        </div>
                        <div class="form-group">
                            <label>Số điện thoại</label>
                            <input type="tel" id="m_Phone" value="${student ? student.Phone : ''}" placeholder="090..." required>
                        </div>
                        <div class="form-group">
                            <label>Ngày sinh</label>
                            <input type="date" id="m_DoB" value="${student ? formatDateForInput(student.DoB) : ''}">
                        </div>
                        <div class="form-group">
                            <label>Giới tính</label>
                            <select id="m_Gender">
                                <option value="Nam" ${student && student.Gender === 'Nam' ? 'selected' : ''}>Nam</option>
                                <option value="Nữ" ${student && student.Gender === 'Nữ' ? 'selected' : ''}>Nữ</option>
                                <option value="Khác" ${student && student.Gender === 'Khác' ? 'selected' : ''}>Khác</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Trình độ</label>
                            <input type="text" id="m_Level" value="${student ? student.Level : ''}" placeholder="Beginner/IELTS 5.0...">
                        </div>
                        <div class="form-group">
                            <label>Địa chỉ</label>
                            <input type="text" id="m_Address" value="${student ? student.Address : ''}" placeholder="Địa chỉ cư trú">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Hủy</button>
                    <button type="submit" class="btn-primary">Lưu thông tin</button>
                </div>
            </form>
        </div>
    `;
    
    openModal(html);

    // Xử lý submit form
    document.getElementById('studentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            StudentID: document.getElementById('m_StudentID').value,
            FullName: document.getElementById('m_FullName').value,
            Email: document.getElementById('m_Email').value,
            Phone: document.getElementById('m_Phone').value,
            DoB: document.getElementById('m_DoB').value,
            Gender: document.getElementById('m_Gender').value,
            Level: document.getElementById('m_Level').value,
            Address: document.getElementById('m_Address').value
        };
        
        showGlobalLoader(true);
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: studentId ? "UPDATE" : "CREATE",
                    sheetName: "Students",
                    data: data
                })
            });
            const result = await response.json();
            if (result.status === 'success') {
                alert(result.message);
                closeModal();
                renderStudentsPage(); // Tải lại bảng
            } else {
                alert("Lỗi: " + result.message);
            }
        } catch (error) {
            alert("Lỗi kết nối máy chủ!");
        } finally {
            showGlobalLoader(false);
        }
    });
}

// Xóa Học viên
window.deleteStudent = async function(studentId) {
    if (!confirm(`Bạn có chắc chắn muốn xóa học viên ${studentId}?`)) return;
    
    showGlobalLoader(true);
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: "DELETE",
                sheetName: "Students",
                data: { StudentID: studentId }
            })
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert(result.message);
            renderStudentsPage();
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        alert("Lỗi kết nối máy chủ!");
    } finally {
        showGlobalLoader(false);
    }
}
