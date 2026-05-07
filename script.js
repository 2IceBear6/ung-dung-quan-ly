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

// Kiểm tra định dạng Email
function validateEmail(email) {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
}

// Kiểm tra định dạng SĐT Việt Nam
function validatePhone(phone) {
    return /(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/.test(phone);
}

// Đảm bảo số điện thoại luôn có số 0 ở đầu (phòng trường hợp Google Sheets bỏ mất)
function ensureLeadingZero(phone) {
    if (!phone) return "";
    let p = phone.toString().trim();
    if (p.length === 9 && !p.startsWith("0") && !p.startsWith("84")) {
        return "0" + p;
    }
    return p;
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
    } else if (pageId === 'teachers') {
        renderTeachersPage();
    } else if (pageId === 'courses') {
        renderCoursesPage();
    } else if (pageId === 'classes') {
        renderClassesPage();
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
                            <th>Ngày sinh</th>
                            <th>Giới tính</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Trình độ</th>
                            <th>Địa chỉ</th>
                            <th style="width: 100px;">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="studentsTableBody">
                        <tr><td colspan="9" style="text-align:center;">Đang tải dữ liệu...</td></tr>
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
                tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Chưa có học viên nào trong Database</td></tr>`;
                return;
            }
            
            // Lưu data vào window để dùng cho việc edit
            window.allStudentsData = students;

            tbody.innerHTML = students.map(s => `
                <tr>
                    <td><span class="badge badge-success">${s.StudentID || 'N/A'}</span></td>
                    <td>${s.FullName}</td>
                    <td>${s.DoB ? new Date(s.DoB).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td>${s.Gender || 'N/A'}</td>
                    <td>${s.Email}</td>
                    <td>${ensureLeadingZero(s.Phone)}</td>
                    <td>${s.Level}</td>
                    <td><small>${s.Address || 'N/A'}</small></td>
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
        document.getElementById('studentsTableBody').innerHTML = `<tr><td colspan="9" style="text-align:center; color: red;">Lỗi tải dữ liệu</td></tr>`;
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
                            <input type="tel" id="m_Phone" value="${student ? ensureLeadingZero(student.Phone) : ''}" placeholder="090..." required>
                        </div>
                        <div class="form-group">
                            <label>Ngày sinh</label>
                            <input type="date" id="m_DoB" value="${student ? formatDateForInput(student.DoB) : ''}" max="${new Date().toISOString().split('T')[0]}">
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
            StudentID: document.getElementById('m_StudentID').value.trim(),
            FullName: document.getElementById('m_FullName').value.trim(),
            Email: document.getElementById('m_Email').value.trim(),
            Phone: document.getElementById('m_Phone').value.trim(),
            DoB: document.getElementById('m_DoB').value,
            Gender: document.getElementById('m_Gender').value,
            Level: document.getElementById('m_Level').value.trim(),
            Address: document.getElementById('m_Address').value.trim()
        };
        
        // VALIDATION THEO RULE 5 (NÂNG CAO)
        if (!data.StudentID || !data.FullName || !data.Email || !data.Phone) {
            alert("Vui lòng điền đầy đủ các trường bắt buộc (*)");
            return;
        }
        if (data.StudentID.includes(" ")) {
            alert("Mã học viên không được chứa khoảng trắng!");
            return;
        }
        if (!validateEmail(data.Email)) {
            alert("Email không hợp lệ! Vui lòng kiểm tra lại.");
            return;
        }
        if (!validatePhone(data.Phone)) {
            alert("Số điện thoại không đúng định dạng Việt Nam!");
            return;
        }
        
        // VALIDATION NGÀY SINH (RULE 5)
        if (!data.DoB) {
            alert("Vui lòng chọn ngày sinh của học viên!");
            return;
        }
        const dobDate = new Date(data.DoB);
        const today = new Date();
        if (dobDate > today) {
            alert("Ngày sinh không thể nằm trong tương lai!");
            return;
        }
        const age = today.getFullYear() - dobDate.getFullYear();
        if (age < 3 || age > 100) {
            alert("Ngày sinh không hợp lệ (Học viên phải từ 3 đến 100 tuổi)!");
            return;
        }
        
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
// ==========================================
// QUẢN LÝ GIÁO VIÊN (CRUD)
// ==========================================
async function renderTeachersPage() {
    pageTitle.textContent = "Quản lý Giáo viên";
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Danh sách giáo viên</h3>
                <button class="btn-primary" onclick="showTeacherModal()"><i class="fa-solid fa-plus"></i> Thêm mới</button>
            </div>
            <div class="table-responsive">
                <table id="teachersTable">
                    <thead>
                        <tr>
                            <th>Mã GV</th>
                            <th>Họ và Tên</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Chuyên môn</th>
                            <th>Mức lương</th>
                            <th style="width: 100px;">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="teachersTableBody">
                        <tr><td colspan="7" style="text-align:center;">Đang tải dữ liệu...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    try {
        const response = await fetch(`${SCRIPT_URL}?sheetName=Teachers`);
        const result = await response.json();
        const tbody = document.getElementById('teachersTableBody');
        
        if (result.status === 'success') {
            const teachers = result.data;
            if (teachers.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Chưa có giáo viên nào trong Database</td></tr>`;
                return;
            }
            
            window.allTeachersData = teachers;

            tbody.innerHTML = teachers.map(t => `
                <tr>
                    <td><span class="badge badge-warning">${t.TeacherID || 'N/A'}</span></td>
                    <td><strong>${t.FullName}</strong></td>
                    <td>${t.Email}</td>
                    <td>${ensureLeadingZero(t.Phone)}</td>
                    <td>${t.Expertise}</td>
                    <td>${Number(t.Salary).toLocaleString()} VNĐ</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit" title="Sửa" onclick="showTeacherModal('${t.TeacherID}')"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-delete" title="Xóa" onclick="deleteTeacher('${t.TeacherID}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) {
        document.getElementById('teachersTableBody').innerHTML = `<tr><td colspan="7" style="text-align:center; color: red;">Lỗi tải dữ liệu</td></tr>`;
    }
}

window.showTeacherModal = function(teacherId = null) {
    let teacher = null;
    let title = "Thêm giáo viên mới";
    
    if (teacherId) {
        teacher = window.allTeachersData.find(t => t.TeacherID === teacherId);
        title = "Chỉnh sửa giáo viên";
    }

    const html = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="btn-icon" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form id="teacherForm">
                <div class="modal-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Mã giáo viên (TeacherID)</label>
                            <input type="text" id="m_TeacherID" value="${teacher ? teacher.TeacherID : ''}" placeholder="GV001" ${teacher ? 'readonly' : 'required'} style="background: ${teacher ? '#f8fafc' : 'white'}">
                        </div>
                        <div class="form-group">
                            <label>Họ và Tên</label>
                            <input type="text" id="m_FullName" value="${teacher ? teacher.FullName : ''}" placeholder="Nguyễn Văn B" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="m_Email" value="${teacher ? teacher.Email : ''}" placeholder="teacher@example.com" required>
                        </div>
                        <div class="form-group">
                            <label>Số điện thoại</label>
                            <input type="tel" id="m_Phone" value="${teacher ? ensureLeadingZero(teacher.Phone) : ''}" placeholder="091..." required>
                        </div>
                        <div class="form-group">
                            <label>Chuyên môn</label>
                            <input type="text" id="m_Expertise" value="${teacher ? teacher.Expertise : ''}" placeholder="Tiếng Anh Giao tiếp/IELTS">
                        </div>
                        <div class="form-group">
                            <label>Mức lương</label>
                            <input type="number" id="m_Salary" value="${teacher ? teacher.Salary : ''}" placeholder="10000000">
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

    document.getElementById('teacherForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            TeacherID: document.getElementById('m_TeacherID').value.trim(),
            FullName: document.getElementById('m_FullName').value.trim(),
            Email: document.getElementById('m_Email').value.trim(),
            Phone: document.getElementById('m_Phone').value.trim(),
            Expertise: document.getElementById('m_Expertise').value.trim(),
            Salary: document.getElementById('m_Salary').value
        };
        
        // VALIDATION THEO RULE 5 (NÂNG CAO)
        if (!data.TeacherID || !data.FullName || !data.Email || !data.Phone) {
            alert("Vui lòng điền đầy đủ các trường bắt buộc của giáo viên!");
            return;
        }
        if (data.TeacherID.includes(" ")) {
            alert("Mã giáo viên không được chứa khoảng trắng!");
            return;
        }
        if (!validateEmail(data.Email)) {
            alert("Email giáo viên không hợp lệ!");
            return;
        }
        if (!validatePhone(data.Phone)) {
            alert("Số điện thoại giáo viên không hợp lệ!");
            return;
        }
        if (Number(data.Salary) <= 0) {
            alert("Mức lương phải là một số dương lớn hơn 0!");
            return;
        }
        
        showGlobalLoader(true);
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: teacherId ? "UPDATE" : "CREATE",
                    sheetName: "Teachers",
                    data: data
                })
            });
            const result = await response.json();
            if (result.status === 'success') {
                alert(result.message);
                closeModal();
                renderTeachersPage();
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

window.deleteTeacher = async function(teacherId) {
    if (!confirm(`Bạn có chắc chắn muốn xóa giáo viên ${teacherId}?`)) return;
    
    showGlobalLoader(true);
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: "DELETE",
                sheetName: "Teachers",
                data: { TeacherID: teacherId }
            })
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert(result.message);
            renderTeachersPage();
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        alert("Lỗi kết nối máy chủ!");
    } finally {
        showGlobalLoader(false);
    }
}
// ==========================================
// QUẢN LÝ KHÓA HỌC (CRUD)
// ==========================================
async function renderCoursesPage() {
    pageTitle.textContent = "Quản lý Khóa học";
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Danh sách khóa học</h3>
                <button class="btn-primary" onclick="showCourseModal()"><i class="fa-solid fa-plus"></i> Thêm mới</button>
            </div>
            <div class="table-responsive">
                <table id="coursesTable">
                    <thead>
                        <tr>
                            <th>Mã khóa</th>
                            <th>Tên khóa học</th>
                            <th>Thời lượng</th>
                            <th>Học phí</th>
                            <th>Mô tả</th>
                            <th>Trạng thái</th>
                            <th style="width: 100px;">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="coursesTableBody">
                        <tr><td colspan="7" style="text-align:center;">Đang tải dữ liệu...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    try {
        const response = await fetch(`${SCRIPT_URL}?sheetName=Courses`);
        const result = await response.json();
        const tbody = document.getElementById('coursesTableBody');
        
        if (result.status === 'success') {
            const courses = result.data;
            if (courses.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Chưa có khóa học nào trong Database</td></tr>`;
                return;
            }
            
            window.allCoursesData = courses;

            tbody.innerHTML = courses.map(c => `
                <tr>
                    <td><span class="badge badge-info">${c.CourseID || 'N/A'}</span></td>
                    <td><strong>${c.CourseName}</strong></td>
                    <td>${c.Duration} tuần</td>
                    <td>${Number(c.Fee).toLocaleString()} VNĐ</td>
                    <td><small>${c.Description || 'N/A'}</small></td>
                    <td><span class="badge ${c.Status === 'Active' ? 'badge-success' : 'badge-danger'}">${c.Status || 'Active'}</span></td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit" title="Sửa" onclick="showCourseModal('${c.CourseID}')"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-delete" title="Xóa" onclick="deleteCourse('${c.CourseID}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) {
        document.getElementById('coursesTableBody').innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Lỗi tải dữ liệu</td></tr>`;
    }
}

window.showCourseModal = function(courseId = null) {
    let course = null;
    let title = "Thêm khóa học mới";
    
    if (courseId) {
        course = window.allCoursesData.find(c => c.CourseID === courseId);
        title = "Chỉnh sửa khóa học";
    }

    const html = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="btn-icon" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form id="courseForm">
                <div class="modal-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Mã khóa học (CourseID)</label>
                            <input type="text" id="m_CourseID" value="${course ? course.CourseID : ''}" placeholder="ENG001" ${course ? 'readonly' : 'required'} style="background: ${course ? '#f8fafc' : 'white'}">
                        </div>
                        <div class="form-group">
                            <label>Tên khóa học</label>
                            <input type="text" id="m_CourseName" value="${course ? course.CourseName : ''}" placeholder="IELTS Foundation" required>
                        </div>
                        <div class="form-group">
                            <label>Thời lượng (tuần)</label>
                            <input type="number" id="m_Duration" value="${course ? course.Duration : ''}" placeholder="12" required>
                        </div>
                        <div class="form-group">
                            <label>Học phí (VNĐ)</label>
                            <input type="number" id="m_Fee" value="${course ? course.Fee : ''}" placeholder="5000000" required>
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Mô tả ngắn</label>
                            <input type="text" id="m_Description" value="${course ? course.Description : ''}" placeholder="Khóa học dành cho người mới bắt đầu...">
                        </div>
                        <div class="form-group">
                            <label>Trạng thái</label>
                            <select id="m_Status">
                                <option value="Active" ${course && course.Status === 'Active' ? 'selected' : ''}>Đang mở</option>
                                <option value="Inactive" ${course && course.Status === 'Inactive' ? 'selected' : ''}>Đã đóng</option>
                            </select>
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

    document.getElementById('courseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            CourseID: document.getElementById('m_CourseID').value.trim(),
            CourseName: document.getElementById('m_CourseName').value.trim(),
            Duration: document.getElementById('m_Duration').value,
            Fee: document.getElementById('m_Fee').value,
            Description: document.getElementById('m_Description').value.trim(),
            Status: document.getElementById('m_Status').value
        };
        
        // VALIDATION THEO RULE 5
        if (!data.CourseID || !data.CourseName || !data.Duration || !data.Fee) {
            alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
            return;
        }
        if (data.CourseID.includes(" ")) {
            alert("Mã khóa học không được chứa khoảng trắng!");
            return;
        }
        if (Number(data.Duration) <= 0) {
            alert("Thời lượng khóa học phải lớn hơn 0!");
            return;
        }
        if (Number(data.Fee) <= 0) {
            alert("Học phí phải là một số dương!");
            return;
        }
        
        showGlobalLoader(true);
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: courseId ? "UPDATE" : "CREATE",
                    sheetName: "Courses",
                    data: data
                })
            });
            const result = await response.json();
            if (result.status === 'success') {
                alert(result.message);
                closeModal();
                renderCoursesPage();
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

window.deleteCourse = async function(courseId) {
    if (!confirm(`Bạn có chắc chắn muốn xóa khóa học ${courseId}?`)) return;
    
    showGlobalLoader(true);
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: "DELETE",
                sheetName: "Courses",
                data: { CourseID: courseId }
            })
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert(result.message);
            renderCoursesPage();
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        alert("Lỗi kết nối máy chủ!");
    } finally {
        showGlobalLoader(false);
    }
}
// ==========================================
// QUẢN LÝ LỚP HỌC (CRUD)
// ==========================================
async function renderClassesPage() {
    pageTitle.textContent = "Quản lý Lớp học";
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Danh sách lớp học</h3>
                <button class="btn-primary" onclick="showClassModal()"><i class="fa-solid fa-plus"></i> Thêm mới</button>
            </div>
            <div class="table-responsive">
                <table id="classesTable">
                    <thead>
                        <tr>
                            <th>Mã lớp</th>
                            <th>Tên lớp</th>
                            <th>Khóa học</th>
                            <th>Giáo viên</th>
                            <th>Link học</th>
                            <th>Sĩ số tối đa</th>
                            <th style="width: 100px;">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="classesTableBody">
                        <tr><td colspan="7" style="text-align:center;">Đang tải dữ liệu...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    try {
        const response = await fetch(`${SCRIPT_URL}?sheetName=Classes`);
        const result = await response.json();
        const tbody = document.getElementById('classesTableBody');
        
        if (result.status === 'success') {
            const classes = result.data;
            if (classes.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Chưa có lớp học nào trong Database</td></tr>`;
                return;
            }
            
            window.allClassesData = classes;

            tbody.innerHTML = classes.map(c => `
                <tr>
                    <td><span class="badge badge-success">${c.ClassID || 'N/A'}</span></td>
                    <td><strong>${c.ClassName}</strong></td>
                    <td>${c.CourseID}</td>
                    <td>${c.TeacherID}</td>
                    <td>
                        ${c.MeetingLink ? `<a href="${c.MeetingLink}" target="_blank" class="badge badge-info" style="text-decoration:none;"><i class="fa-solid fa-video"></i> Mở Link</a>` : '<span class="badge badge-danger">Chưa có link</span>'}
                    </td>
                    <td>${c.MaxStudents || 20}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit" title="Sửa" onclick="showClassModal('${c.ClassID}')"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-delete" title="Xóa" onclick="deleteClass('${c.ClassID}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) {
        document.getElementById('classesTableBody').innerHTML = `<tr><td colspan="7" style="text-align:center; color: red;">Lỗi tải dữ liệu</td></tr>`;
    }
}

window.showClassModal = async function(classId = null) {
    showGlobalLoader(true);
    let classData = null;
    let title = "Thêm lớp học mới";
    
    try {
        // Lấy danh sách Khóa học và Giáo viên để làm Dropdown
        const [courseRes, teacherRes] = await Promise.all([
            fetch(`${SCRIPT_URL}?sheetName=Courses`),
            fetch(`${SCRIPT_URL}?sheetName=Teachers`)
        ]);
        const courses = (await courseRes.json()).data;
        const teachers = (await teacherRes.json()).data;

        if (classId) {
            classData = window.allClassesData.find(c => c.ClassID === classId);
            title = "Chỉnh sửa lớp học";
        }

        const html = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="btn-icon" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <form id="classForm">
                    <div class="modal-body">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Mã lớp học (ClassID)</label>
                                <input type="text" id="m_ClassID" value="${classData ? classData.ClassID : ''}" placeholder="L001" ${classData ? 'readonly' : 'required'} style="background: ${classData ? '#f8fafc' : 'white'}">
                            </div>
                            <div class="form-group">
                                <label>Tên lớp học</label>
                                <input type="text" id="m_ClassName" value="${classData ? classData.ClassName : ''}" placeholder="Lớp IELTS Sáng T2-T4" required>
                            </div>
                            <div class="form-group">
                                <label>Khóa học (*)</label>
                                <select id="m_CourseID" required>
                                    <option value="">-- Chọn khóa học --</option>
                                    ${courses.map(c => `<option value="${c.CourseID}" ${classData && classData.CourseID === c.CourseID ? 'selected' : ''}>${c.CourseName} (${c.CourseID})</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Giáo viên (*)</label>
                                <select id="m_TeacherID" required>
                                    <option value="">-- Chọn giáo viên --</option>
                                    ${teachers.map(t => `<option value="${t.TeacherID}" ${classData && classData.TeacherID === t.TeacherID ? 'selected' : ''}>${t.FullName} (${t.TeacherID})</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Link học Online (Google Meet/Zoom)</label>
                                <input type="url" id="m_MeetingLink" value="${classData ? classData.MeetingLink : ''}" placeholder="https://meet.google.com/xxx-xxxx-xxx">
                            </div>
                            <div class="form-group">
                                <label>Sĩ số tối đa</label>
                                <input type="number" id="m_MaxStudents" value="${classData ? classData.MaxStudents : '20'}" required>
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

        document.getElementById('classForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                ClassID: document.getElementById('m_ClassID').value.trim(),
                ClassName: document.getElementById('m_ClassName').value.trim(),
                CourseID: document.getElementById('m_CourseID').value,
                TeacherID: document.getElementById('m_TeacherID').value,
                MeetingLink: document.getElementById('m_MeetingLink').value.trim(),
                MaxStudents: document.getElementById('m_MaxStudents').value
            };
            
            // VALIDATION THEO RULE 5
            if (!data.ClassID || !data.ClassName || !data.CourseID || !data.TeacherID) {
                alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
                return;
            }
            if (data.ClassID.includes(" ")) {
                alert("Mã lớp học không được chứa khoảng trắng!");
                return;
            }
            if (Number(data.MaxStudents) <= 0) {
                alert("Sĩ số tối đa phải lớn hơn 0!");
                return;
            }
            
            showGlobalLoader(true);
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: classId ? "UPDATE" : "CREATE",
                        sheetName: "Classes",
                        data: data
                    })
                });
                const result = await response.json();
                if (result.status === 'success') {
                    alert(result.message);
                    closeModal();
                    renderClassesPage();
                } else {
                    alert("Lỗi: " + result.message);
                }
            } catch (error) {
                alert("Lỗi kết nối máy chủ!");
            } finally {
                showGlobalLoader(false);
            }
        });

    } catch (error) {
        alert("Không thể tải danh sách khóa học/giáo viên!");
    } finally {
        showGlobalLoader(false);
    }
}

window.deleteClass = async function(classId) {
    if (!confirm(`Bạn có chắc chắn muốn xóa lớp học ${classId}?`)) return;
    
    showGlobalLoader(true);
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: "DELETE",
                sheetName: "Classes",
                data: { ClassID: classId }
            })
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert(result.message);
            renderClassesPage();
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        alert("Lỗi kết nối máy chủ!");
    } finally {
        showGlobalLoader(false);
    }
}
