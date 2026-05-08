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
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Chưa có khóa học nào trong Database</td></tr>`;
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
        document.getElementById('coursesTableBody').innerHTML = `<tr><td colspan="7" style="text-align:center; color: red;">Lỗi tải dữ liệu</td></tr>`;
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
                            <input type="number" id="m_Fee" value="${course ? course.Fee : ''}" placeholder="3000000" required>
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Mô tả ngắn</label>
                            <input type="text" id="m_Description" value="${course ? course.Description : ''}" placeholder="Mô tả khóa học...">
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
        
        if (!data.CourseID || !data.CourseName || !data.Fee || !data.Duration) {
            alert("Vui lòng điền đủ các trường bắt buộc!");
            return;
        }
        if (Number(data.Fee) < 0 || Number(data.Duration) <= 0) {
            alert("Học phí và Thời lượng không hợp lệ!");
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
            alert("Lỗi kết nối!");
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
        alert("Lỗi kết nối!");
    } finally {
        showGlobalLoader(false);
    }
}
