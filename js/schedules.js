// ==========================================
// QUẢN LÝ LỊCH HỌC (CRUD)
// ==========================================

async function renderSchedulesPage() {
    pageTitle.textContent = "Quản lý Lịch học";
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Thời khóa biểu chi tiết</h3>
                <button class="btn-primary" onclick="showScheduleModal()"><i class="fa-solid fa-plus"></i> Thêm buổi học</button>
            </div>
            <div class="table-responsive">
                <table id="schedulesTable">
                    <thead>
                        <tr>
                            <th>Mã lịch</th>
                            <th>Lớp học</th>
                            <th>Ngày học</th>
                            <th>Ca học</th>
                            <th>Link học/Ghi chú</th>
                            <th style="width: 100px;">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="schedulesTableBody">
                        <tr><td colspan="6" style="text-align:center;">Đang tải dữ liệu...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    try {
        const response = await fetch(`${SCRIPT_URL}?sheetName=Schedules`);
        const result = await response.json();
        const tbody = document.getElementById('schedulesTableBody');
        
        if (result.status === 'success') {
            const schedules = result.data;
            if (schedules.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Chưa có lịch học nào</td></tr>`;
                return;
            }
            
            window.allSchedulesData = schedules;

            tbody.innerHTML = schedules.map(s => `
                <tr>
                    <td><span class="badge badge-info">${s.ScheduleID || 'N/A'}</span></td>
                    <td><strong>${s.ClassID}</strong></td>
                    <td>${s.Date ? new Date(s.Date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td>${s.Shift}</td>
                    <td>${s.Room || 'Online'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit" title="Sửa" onclick="showScheduleModal('${s.ScheduleID}')"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-delete" title="Xóa" onclick="deleteSchedule('${s.ScheduleID}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) {
        document.getElementById('schedulesTableBody').innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Lỗi tải dữ liệu</td></tr>`;
    }
}

window.showScheduleModal = async function(scheduleId = null) {
    showGlobalLoader(true);
    let scheduleData = null;
    let title = "Thêm buổi học mới";
    
    try {
        const response = await fetch(`${SCRIPT_URL}?sheetName=Classes`);
        const result = await response.json();
        const classes = result.data;

        if (scheduleId) {
            scheduleData = window.allSchedulesData.find(s => s.ScheduleID === scheduleId);
            title = "Chỉnh sửa lịch học";
        }

        const html = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="btn-icon" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <form id="scheduleForm">
                    <div class="modal-body">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Mã lịch (ScheduleID)</label>
                                <input type="text" id="m_ScheduleID" value="${scheduleData ? scheduleData.ScheduleID : ''}" placeholder="SC001" ${scheduleData ? 'readonly' : 'required'} style="background: ${scheduleData ? '#f8fafc' : 'white'}">
                            </div>
                            <div class="form-group">
                                <label>Lớp học (*)</label>
                                <select id="m_ClassID" required>
                                    <option value="">-- Chọn lớp học --</option>
                                    ${classes.map(c => `<option value="${c.ClassID}" ${scheduleData && scheduleData.ClassID === c.ClassID ? 'selected' : ''}>${c.ClassName} (${c.ClassID})</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Ngày học (*)</label>
                                <input type="date" id="m_Date" value="${scheduleData ? formatDateForInput(scheduleData.Date) : ''}" min="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                            <div class="form-group">
                                <label>Ca học (hh:mm-hh:mm) (*)</label>
                                <input type="text" id="m_Shift" value="${scheduleData ? scheduleData.Shift : ''}" placeholder="08:00-09:30" required>
                            </div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Ghi chú / Link</label>
                                <input type="text" id="m_Room" value="${scheduleData ? scheduleData.Room : ''}" placeholder="...">
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

        document.getElementById('scheduleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                ScheduleID: document.getElementById('m_ScheduleID').value.trim(),
                ClassID: document.getElementById('m_ClassID').value,
                Date: document.getElementById('m_Date').value,
                Shift: document.getElementById('m_Shift').value.trim(),
                Room: document.getElementById('m_Room').value.trim()
            };
            
            if (!data.ScheduleID || !data.ClassID || !data.Date || !data.Shift) {
                alert("Thiếu thông tin!");
                return;
            }

            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;
            const match = data.Shift.replace(/\s/g, '').match(timeRegex);
            if (!match) {
                alert("Định dạng giờ sai (hh:mm-hh:mm)!");
                return;
            }

            const startMinutes = parseInt(match[1]) * 60 + parseInt(match[2]);
            const endMinutes = parseInt(match[3]) * 60 + parseInt(match[4]);
            if (endMinutes <= startMinutes) {
                alert("Giờ kết thúc phải sau giờ bắt đầu!");
                return;
            }

            const selectedDate = new Date(data.Date);
            const today = new Date();
            today.setHours(0,0,0,0);
            selectedDate.setHours(0,0,0,0);
            if (selectedDate < today) {
                alert("Không thể chọn ngày quá khứ!");
                return;
            }
            if (selectedDate.getTime() === today.getTime()) {
                const now = new Date();
                const curMin = now.getHours() * 60 + now.getMinutes();
                if (startMinutes < curMin) {
                    alert("Giờ bắt đầu đã qua!");
                    return;
                }
            }
            
            showGlobalLoader(true);
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: scheduleId ? "UPDATE" : "CREATE",
                        sheetName: "Schedules",
                        data: data
                    })
                });
                const res = await response.json();
                if (res.status === 'success') {
                    alert(res.message);
                    closeModal();
                    renderSchedulesPage();
                } else {
                    alert("Lỗi: " + res.message);
                }
            } catch (error) {
                alert("Lỗi kết nối!");
            } finally {
                showGlobalLoader(false);
            }
        });

    } catch (error) {
        alert("Lỗi tải lớp!");
    } finally {
        showGlobalLoader(false);
    }
}

window.deleteSchedule = async function(scheduleId) {
    if (!confirm(`Xóa lịch ${scheduleId}?`)) return;
    
    showGlobalLoader(true);
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: "DELETE",
                sheetName: "Schedules",
                data: { ScheduleID: scheduleId }
            })
        });
        const res = await response.json();
        if (res.status === 'success') {
            alert(res.message);
            renderSchedulesPage();
        } else {
            alert("Lỗi!");
        }
    } catch (e) {
        alert("Lỗi!");
    } finally {
        showGlobalLoader(false);
    }
}
