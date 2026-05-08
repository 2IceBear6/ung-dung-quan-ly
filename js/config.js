// ==========================================
// CẤU HÌNH API & GLOBAL STATE
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxfImM03Y1eDubvgCCBoIz2KU8TQ5k75hcStLkv6PVKJM-IyfGfoVSSjiBDuVmgfIqnkw/exec"; 

// DOM ELEMENTS
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

// TRẠNG THÁI ỨNG DỤNG
let currentUser = null;
