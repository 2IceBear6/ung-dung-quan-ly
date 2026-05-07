// ==========================================
// CẤU HÌNH API (AI điền Web App URL vào đây ở Bước 6)
// ==========================================
const SCRIPT_URL = ""; 

// ==========================================
// DOM ELEMENTS
// ==========================================
const dataForm = document.getElementById('dataForm');
const submitBtn = document.getElementById('submitBtn');
const refreshBtn = document.getElementById('refreshBtn');
const dataTable = document.getElementById('dataTable');
const tableBody = document.getElementById('tableBody');
const tableLoader = document.getElementById('tableLoader');
const formMessage = document.getElementById('formMessage');

// ==========================================
// EVENTS LẮNG NGHE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Chỉ fetch data nếu SCRIPT_URL đã được cấu hình
    if (SCRIPT_URL) {
        fetchData();
    } else {
        tableLoader.classList.add('hidden');
        dataTable.classList.remove('hidden');
        tableBody.innerHTML = `<tr><td colspan="100%" style="text-align:center; color: red;">Chưa cấu hình Google Apps Script URL. Vui lòng cập nhật biến SCRIPT_URL.</td></tr>`;
    }
});

refreshBtn.addEventListener('click', () => {
    if (SCRIPT_URL) fetchData();
});

dataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!SCRIPT_URL) {
        showMessage('Vui lòng cấu hình SCRIPT_URL trước', 'error');
        return;
    }

    // 1. Thu thập dữ liệu từ Form
    const formData = new FormData(dataForm);
    const dataObj = {};
    formData.forEach((value, key) => {
        dataObj[key] = value;
    });

    // 2. Gửi request lên Google Sheets
    await submitData(dataObj);
});

// ==========================================
// HÀM FETCH DỮ LIỆU TỪ GOOGLE SHEETS (GET)
// ==========================================
async function fetchData() {
    try {
        tableLoader.classList.remove('hidden');
        dataTable.classList.add('hidden');

        const response = await fetch(SCRIPT_URL);
        const result = await response.json();

        if (result.status === 'success') {
            renderTable(result.data);
        } else {
            console.error(result.message);
            tableBody.innerHTML = `<tr><td colspan="100%">Lỗi: ${result.message}</td></tr>`;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        tableBody.innerHTML = `<tr><td colspan="100%">Lỗi kết nối. Vui lòng thử lại.</td></tr>`;
    } finally {
        tableLoader.classList.add('hidden');
        dataTable.classList.remove('hidden');
    }
}

// ==========================================
// HÀM GỬI DỮ LIỆU LÊN GOOGLE SHEETS (POST)
// ==========================================
async function submitData(dataObj) {
    try {
        setLoading(true);
        hideMessage();

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            // Tránh preflight CORS request bằng cách dùng text/plain nếu cần
            body: JSON.stringify({
                action: "CREATE",
                data: dataObj
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            showMessage(result.message || 'Thành công!', 'success');
            dataForm.reset();
            fetchData(); // Load lại data
        } else {
            showMessage(result.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        console.error("Submit error:", error);
        showMessage('Lỗi kết nối mạng, vui lòng thử lại!', 'error');
    } finally {
        setLoading(false);
    }
}

// ==========================================
// UTILS & HELPERS
// ==========================================
function renderTable(dataArray) {
    tableBody.innerHTML = '';
    if (!dataArray || dataArray.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="100%" style="text-align:center;">Chưa có dữ liệu.</td></tr>`;
        return;
    }

    dataArray.forEach(row => {
        const tr = document.createElement('tr');
        // AI sẽ điều chỉnh logic render này dựa trên Data Model
        tr.innerHTML = `
            <td>${row['Ví dụ trường dữ liệu'] || ''}</td>
            <td>...</td>
        `;
        tableBody.appendChild(tr);
    });
}

function setLoading(isLoading) {
    const loader = submitBtn.querySelector('.loader');
    const btnText = submitBtn.querySelector('.btn-text');
    submitBtn.disabled = isLoading;
    if (isLoading) {
        loader.classList.remove('hidden');
        btnText.textContent = 'Đang xử lý...';
    } else {
        loader.classList.add('hidden');
        btnText.textContent = 'Gửi dữ liệu';
    }
}

function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = `message ${type}`;
    formMessage.classList.remove('hidden');
}

function hideMessage() {
    formMessage.classList.add('hidden');
}
