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
        
        if (!data.StudentID || !data.FullName || !data.Email || !data.Phone) {
            alert("Vui lòng điền đầy đủ các trường bắt buộc (*)");
            return;
        }
        if (data.StudentID.includes(" ")) {
            alert("Mã học viên không được chứa khoảng trắng!");
            return;
        }
        if (!validateEmail(data.Email)) {
            alert("Email không hợp lệ!");
            return;
        }
        if (!validatePhone(data.Phone)) {
            alert("Số điện thoại không đúng định dạng Việt Nam!");
            return;
        }
        
        if (!data.DoB) {
            alert("Vui lòng chọn ngày sinh!");
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
            alert("Học viên phải từ 3 đến 100 tuổi!");
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
                renderStudentsPage();
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
