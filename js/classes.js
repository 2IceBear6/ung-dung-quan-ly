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
                                <input type="text" id="m_ClassName" value="${classData ? classData.ClassName : ''}" placeholder="Lớp học..." required>
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
                                <label>Link học Online</label>
                                <input type="url" id="m_MeetingLink" value="${classData ? classData.MeetingLink : ''}" placeholder="https://...">
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
            
            if (!data.ClassID || !data.ClassName || !data.CourseID || !data.TeacherID) {
                alert("Vui lòng điền đủ thông tin!");
                return;
            }
            if (Number(data.MaxStudents) <= 0) {
                alert("Sĩ số không hợp lệ!");
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
                alert("Lỗi kết nối!");
            } finally {
                showGlobalLoader(false);
            }
        });

    } catch (error) {
        alert("Lỗi tải dữ liệu!");
    } finally {
        showGlobalLoader(false);
    }
}

window.deleteClass = async function(classId) {
    if (!confirm(`Bạn có chắc xóa lớp ${classId}?`)) return;
    
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
        alert("Lỗi kết nối!");
    } finally {
        showGlobalLoader(false);
    }
}
