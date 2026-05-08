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
        
        if (!data.TeacherID || !data.FullName || !data.Email || !data.Phone) {
            alert("Vui lòng điền đầy đủ các trường!");
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
            alert("Mức lương phải là số dương!");
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
