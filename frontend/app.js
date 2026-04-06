/**
 * Network Monitoring Dashboard - Frontend Application
 * Real-time network monitoring interface with Chart.js visualizations
 */

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// State Management
const state = {
    devices: [],
    alerts: [],
    stats: null,
    currentView: 'dashboard',
    currentFilter: 'all',
    charts: {
        response: null,
        distribution: null,
        deviceHistory: null
    },
    refreshInterval: null,
    selectedDevice: null
};

// DOM Elements
const elements = {
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    pageTitle: document.getElementById('page-title'),
    
    // Views
    views: document.querySelectorAll('.view'),
    dashboardView: document.getElementById('dashboard-view'),
    devicesView: document.getElementById('devices-view'),
    alertsView: document.getElementById('alerts-view'),
    
    // Stats
    totalDevices: document.getElementById('total-devices'),
    onlineDevices: document.getElementById('online-devices'),
    warningDevices: document.getElementById('warning-devices'),
    offlineDevices: document.getElementById('offline-devices'),
    avgUptime: document.getElementById('avg-uptime'),
    avgResponse: document.getElementById('avg-response'),
    
    // Devices
    devicesGrid: document.getElementById('devices-grid'),
    searchInput: document.getElementById('search-input'),
    
    // Alerts
    alertBadge: document.getElementById('alert-badge'),
    recentAlerts: document.getElementById('recent-alerts'),
    alertsTbody: document.getElementById('alerts-tbody'),
    alertsEmpty: document.getElementById('alerts-empty'),
    
    // Charts
    responseChart: document.getElementById('response-chart'),
    distributionChart: document.getElementById('distribution-chart'),
    deviceHistoryChart: document.getElementById('device-history-chart'),
    
    // Modal
    deviceModal: document.getElementById('device-modal'),
    modalClose: document.getElementById('modal-close'),
    modalDeviceName: document.getElementById('modal-device-name'),
    modalIp: document.getElementById('modal-ip'),
    modalType: document.getElementById('modal-type'),
    modalLocation: document.getElementById('modal-location'),
    modalStatus: document.getElementById('modal-status'),
    modalUptime: document.getElementById('modal-uptime'),
    modalResponse: document.getElementById('modal-response'),
    
    // Buttons
    refreshBtn: document.getElementById('refresh-btn'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    connectionText: document.getElementById('connection-text'),
    statusDot: document.querySelector('.status-dot')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    startAutoRefresh();
    loadInitialData();
});

// Event Listeners
function initializeEventListeners() {
    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            switchView(view);
        });
    });
    
    // View All link
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            switchView(view);
        });
    });
    
    // Refresh button
    elements.refreshBtn.addEventListener('click', () => {
        refreshData();
        elements.refreshBtn.classList.add('spinning');
        setTimeout(() => elements.refreshBtn.classList.remove('spinning'), 500);
    });
    
    // Search input
    elements.searchInput.addEventListener('input', (e) => {
        filterDevices(e.target.value);
    });
    
    // Filter tabs
    elements.filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.dataset.filter;
            setFilter(filter);
        });
    });
    
    // Modal close
    elements.modalClose.addEventListener('click', closeModal);
    elements.deviceModal.addEventListener('click', (e) => {
        if (e.target === elements.deviceModal) closeModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'r' && !e.ctrlKey && !e.metaKey) refreshData();
    });
}

// View Management
function switchView(viewName) {
    state.currentView = viewName;
    
    // Update navigation
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
    
    // Update views
    elements.views.forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        devices: 'Devices',
        alerts: 'Alerts'
    };
    elements.pageTitle.textContent = titles[viewName] || 'Dashboard';
    
    // Refresh data for the current view
    if (viewName === 'devices') {
        renderDevices();
    } else if (viewName === 'alerts') {
        renderAlertsTable();
    }
}

// Data Loading
async function loadInitialData() {
    try {
        await Promise.all([
            fetchDevices(),
            fetchStats(),
            fetchAlerts()
        ]);
        initializeCharts();
        updateConnectionStatus(true);
    } catch (error) {
        console.error('Failed to load initial data:', error);
        updateConnectionStatus(false);
    }
}

async function refreshData() {
    try {
        await Promise.all([
            fetchDevices(),
            fetchStats(),
            fetchAlerts()
        ]);
        updateCharts();
    } catch (error) {
        console.error('Failed to refresh data:', error);
        updateConnectionStatus(false);
    }
}

// API Calls
async function fetchDevices() {
    try {
        const response = await fetch(`${API_BASE_URL}/devices`);
        if (!response.ok) throw new Error('Failed to fetch devices');
        state.devices = await response.json();
        renderDevices();
        return state.devices;
    } catch (error) {
        console.error('Error fetching devices:', error);
        return [];
    }
}

async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        state.stats = await response.json();
        updateStatsDisplay();
        return state.stats;
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
}

async function fetchAlerts() {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts`);
        if (!response.ok) throw new Error('Failed to fetch alerts');
        state.alerts = await response.json();
        updateAlertsDisplay();
        return state.alerts;
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return [];
    }
}

async function fetchDeviceHistory(deviceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/history`);
        if (!response.ok) throw new Error('Failed to fetch history');
        return await response.json();
    } catch (error) {
        console.error('Error fetching device history:', error);
        return [];
    }
}

async function acknowledgeAlert(alertId) {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to acknowledge alert');
        await fetchAlerts();
    } catch (error) {
        console.error('Error acknowledging alert:', error);
    }
}

// Render Functions
function updateStatsDisplay() {
    if (!state.stats) return;
    
    animateValue(elements.totalDevices, parseInt(elements.totalDevices.textContent) || 0, state.stats.total_devices, 500);
    animateValue(elements.onlineDevices, parseInt(elements.onlineDevices.textContent) || 0, state.stats.online_devices, 500);
    animateValue(elements.warningDevices, parseInt(elements.warningDevices.textContent) || 0, state.stats.warning_devices, 500);
    animateValue(elements.offlineDevices, parseInt(elements.offlineDevices.textContent) || 0, state.stats.offline_devices, 500);
    elements.avgUptime.textContent = `${state.stats.avg_uptime}%`;
    elements.avgResponse.textContent = `${state.stats.avg_response_time}ms`;
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();
    
    const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(start + (range * progress));
        element.textContent = value;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    };
    
    requestAnimationFrame(update);
}

function renderDevices(filter = 'all', searchTerm = '') {
    let devices = [...state.devices];
    
    // Apply status filter
    if (filter !== 'all') {
        devices = devices.filter(d => d.status === filter);
    }
    
    // Apply search filter
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        devices = devices.filter(d => 
            d.name.toLowerCase().includes(term) ||
            d.ip.includes(term) ||
            d.location.toLowerCase().includes(term)
        );
    }
    
    if (devices.length === 0) {
        elements.devicesGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                    <line x1="6" y1="6" x2="6.01" y2="6"/>
                    <line x1="6" y1="18" x2="6.01" y2="18"/>
                </svg>
                <p>No devices found</p>
            </div>
        `;
        return;
    }
    
    elements.devicesGrid.innerHTML = devices.map(device => `
        <div class="device-card" data-device-id="${device.id}">
            <div class="device-card-header">
                <div class="device-info">
                    <h3>${device.name}</h3>
                    <span class="device-ip">${device.ip}</span>
                </div>
                <span class="device-status ${device.status}">${device.status}</span>
            </div>
            <div class="device-metrics">
                <div class="metric">
                    <span class="metric-label">Uptime</span>
                    <span class="metric-value">${device.uptime}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Response</span>
                    <span class="metric-value">${device.response_time}ms</span>
                </div>
            </div>
            <span class="device-type-badge">${device.type}</span>
            <div class="device-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                ${device.location}
            </div>
        </div>
    `).join('');
    
    // Add click handlers for device cards
    document.querySelectorAll('.device-card').forEach(card => {
        card.addEventListener('click', () => {
            const deviceId = parseInt(card.dataset.deviceId);
            openDeviceModal(deviceId);
        });
    });
}

function updateAlertsDisplay() {
    // Update badge
    const unacknowledged = state.alerts.filter(a => !a.acknowledged).length;
    elements.alertBadge.textContent = unacknowledged;
    elements.alertBadge.style.display = unacknowledged > 0 ? 'inline' : 'none';
    
    // Update recent alerts on dashboard
    const recentAlerts = state.alerts.slice(0, 5);
    if (recentAlerts.length === 0) {
        elements.recentAlerts.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p>No alerts at this time</p>
            </div>
        `;
    } else {
        elements.recentAlerts.innerHTML = recentAlerts.map(alert => `
            <div class="alert-item ${alert.severity}">
                <span class="alert-severity"></span>
                <div class="alert-content">
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-device">${alert.device_name} (${alert.device_ip})</div>
                    <div class="alert-time">${formatTime(alert.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Update alerts table
    renderAlertsTable();
}

function renderAlertsTable(filter = 'all') {
    let alerts = [...state.alerts];
    
    if (filter !== 'all') {
        alerts = alerts.filter(a => a.severity === filter);
    }
    
    if (alerts.length === 0) {
        elements.alertsTbody.innerHTML = '';
        elements.alertsEmpty.style.display = 'flex';
        return;
    }
    
    elements.alertsEmpty.style.display = 'none';
    elements.alertsTbody.innerHTML = alerts.map(alert => `
        <tr>
            <td>
                <span class="severity-badge ${alert.severity}">
                    <span class="alert-severity" style="width: 6px; height: 6px;"></span>
                    ${alert.severity}
                </span>
            </td>
            <td>
                <div>${alert.device_name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">${alert.device_ip}</div>
            </td>
            <td>${alert.message}</td>
            <td>${formatTime(alert.timestamp)}</td>
            <td>
                <span style="color: ${alert.acknowledged ? 'var(--status-online)' : 'var(--status-warning)'};">
                    ${alert.acknowledged ? 'Acknowledged' : 'Open'}
                </span>
            </td>
            <td>
                <button class="acknowledge-btn" 
                        data-alert-id="${alert.id}" 
                        ${alert.acknowledged ? 'disabled' : ''}>
                    ${alert.acknowledged ? 'Done' : 'Acknowledge'}
                </button>
            </td>
        </tr>
    `).join('');
    
    // Add acknowledge handlers
    document.querySelectorAll('.acknowledge-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
            const alertId = parseInt(btn.dataset.alertId);
            acknowledgeAlert(alertId);
        });
    });
}

// Chart Functions
function initializeCharts() {
    // Response Time Chart
    const responseCtx = elements.responseChart.getContext('2d');
    state.charts.response = new Chart(responseCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Response Time (ms)',
                data: [],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(37, 99, 235, 0.1)' },
                    ticks: { color: '#94a3b8', maxTicksLimit: 10 }
                },
                y: {
                    grid: { color: 'rgba(37, 99, 235, 0.1)' },
                    ticks: { color: '#94a3b8' },
                    beginAtZero: true
                }
            }
        }
    });
    
    // Distribution Chart
    const distCtx = elements.distributionChart.getContext('2d');
    state.charts.distribution = new Chart(distCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#2563eb',
                    '#22c55e',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#94a3b8',
                        padding: 15,
                        usePointStyle: true
                    }
                }
            },
            cutout: '65%'
        }
    });
    
    updateCharts();
}

function updateCharts() {
    // Update response time chart with aggregated data
    if (state.devices.length > 0 && state.charts.response) {
        const now = new Date();
        const labels = [];
        const data = [];
        
        // Create sample data points for the last 20 intervals
        for (let i = 19; i >= 0; i--) {
            const time = new Date(now - i * 30000);
            labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            // Simulate average response time
            const avgResponse = state.devices.reduce((sum, d) => sum + d.response_time, 0) / state.devices.length;
            data.push(Math.round((avgResponse + (Math.random() - 0.5) * 5) * 10) / 10);
        }
        
        state.charts.response.data.labels = labels;
        state.charts.response.data.datasets[0].data = data;
        state.charts.response.update('none');
    }
    
    // Update distribution chart
    if (state.charts.distribution) {
        const typeCount = {};
        state.devices.forEach(device => {
            typeCount[device.type] = (typeCount[device.type] || 0) + 1;
        });
        
        state.charts.distribution.data.labels = Object.keys(typeCount).map(t => t.charAt(0).toUpperCase() + t.slice(1));
        state.charts.distribution.data.datasets[0].data = Object.values(typeCount);
        state.charts.distribution.update('none');
    }
}

async function openDeviceModal(deviceId) {
    const device = state.devices.find(d => d.id === deviceId);
    if (!device) return;
    
    state.selectedDevice = device;
    
    // Update modal content
    elements.modalDeviceName.textContent = device.name;
    elements.modalIp.textContent = device.ip;
    elements.modalType.textContent = device.type.charAt(0).toUpperCase() + device.type.slice(1);
    elements.modalLocation.textContent = device.location;
    elements.modalStatus.textContent = device.status;
    elements.modalStatus.className = `detail-value status-badge ${device.status}`;
    elements.modalUptime.textContent = `${device.uptime}%`;
    elements.modalResponse.textContent = `${device.response_time}ms`;
    
    // Show modal
    elements.deviceModal.classList.add('active');
    
    // Load and display device history
    const history = await fetchDeviceHistory(deviceId);
    renderDeviceHistoryChart(history);
}

function closeModal() {
    elements.deviceModal.classList.remove('active');
    state.selectedDevice = null;
    
    // Destroy device history chart
    if (state.charts.deviceHistory) {
        state.charts.deviceHistory.destroy();
        state.charts.deviceHistory = null;
    }
}

function renderDeviceHistoryChart(history) {
    if (state.charts.deviceHistory) {
        state.charts.deviceHistory.destroy();
    }
    
    const ctx = elements.deviceHistoryChart.getContext('2d');
    const labels = history.map((_, i) => {
        const time = new Date(Date.now() - (history.length - i) * 30000);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
    const data = history.map(h => h.value);
    
    state.charts.deviceHistory = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Response Time (ms)',
                data: data,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#2563eb'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', maxTicksLimit: 8 }
                },
                y: {
                    grid: { color: 'rgba(37, 99, 235, 0.1)' },
                    ticks: { color: '#94a3b8' },
                    beginAtZero: true
                }
            }
        }
    });
}

// Filter Functions
function filterDevices(searchTerm) {
    renderDevices(state.currentFilter, searchTerm);
}

function setFilter(filter) {
    state.currentFilter = filter;
    
    // Update active tab
    elements.filterTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    
    // Re-render based on current view
    if (state.currentView === 'devices') {
        renderDevices(filter, elements.searchInput.value);
    } else if (state.currentView === 'alerts') {
        renderAlertsTable(filter);
    }
}

// Auto Refresh
function startAutoRefresh() {
    state.refreshInterval = setInterval(() => {
        refreshData();
    }, 5000); // Refresh every 5 seconds
}

function updateConnectionStatus(connected) {
    if (connected) {
        elements.statusDot.classList.remove('offline');
        elements.statusDot.classList.add('online');
        elements.connectionText.textContent = 'Connected';
    } else {
        elements.statusDot.classList.remove('online');
        elements.statusDot.classList.add('offline');
        elements.connectionText.textContent = 'Disconnected';
    }
}

// Utility Functions
function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (state.refreshInterval) {
        clearInterval(state.refreshInterval);
    }
    
    Object.values(state.charts).forEach(chart => {
        if (chart) chart.destroy();
    });
});