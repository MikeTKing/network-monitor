# Network Monitoring Dashboard

A full-stack network monitoring dashboard that demonstrates skills relevant to support engineering roles. This project simulates monitoring network devices, tracking uptime, response times, and generating alerts.

## Features

- **Real-time Dashboard**: Live updates every 5 seconds showing network health metrics
- **Device Management**: View and monitor multiple network devices (routers, switches, servers, firewalls)
- **Alert System**: Automatic alert generation for device issues with acknowledgment workflow
- **Interactive Charts**: Response time trends and device distribution visualizations using Chart.js
- **Device Details**: Click any device to view detailed information and response time history
- **Search & Filter**: Find devices quickly by name, IP, or location
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Python 3** with Flask
- **Flask-CORS** for cross-origin requests
- RESTful API design

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**
- **Chart.js** for data visualization
- CSS Custom Properties for theming
- Modern CSS (Flexbox, Grid, backdrop-filter)

## Project Structure

```
network-monitor/
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── index.html          # Dashboard HTML
│   ├── styles.css          # CSS styles
│   └── app.js              # Frontend JavaScript
└── README.md               # This file
```

## Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)
- A modern web browser

### Step 1: Install Python Dependencies

```bash
cd network-monitor/backend
pip install -r requirements.txt
```

### Step 2: Start the Backend Server

```bash
# From the backend directory
python app.py
```

The API server will start at `http://localhost:5000`

### Step 3: Open the Frontend

You can open the frontend in one of two ways:

**Option A: Direct File Open**
Simply open `network-monitor/frontend/index.html` in your web browser.

**Option B: Using a Local Server (Recommended)**
```bash
# From the frontend directory
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/devices` | GET | Get all network devices |
| `/api/devices/<id>` | GET | Get a specific device |
| `/api/devices/<id>/history` | GET | Get response time history |
| `/api/devices/by-type` | GET | Get devices grouped by type |
| `/api/alerts` | GET | Get all alerts |
| `/api/alerts/<id>/acknowledge` | POST | Acknowledge an alert |
| `/api/stats` | GET | Get overall network statistics |
| `/api/health` | GET | Health check endpoint |

## Key Features for Support Engineer Portfolio

This project demonstrates several skills valuable for support engineering roles:

1. **System Monitoring**: Understanding of uptime, response times, and health checks
2. **Alert Management**: Experience with alerting systems and incident response workflows
3. **API Development**: Building and consuming RESTful APIs
4. **Problem Solving**: Simulated troubleshooting scenarios
5. **Documentation**: Clear README and code comments
6. **Full-Stack Development**: Both backend and frontend skills

## Customization

### Adding New Devices

Edit the `DEVICES` list in `backend/app.py`:

```python
DEVICES.append({
    "id": 9,
    "name": "New Device",
    "ip": "192.168.1.100",
    "type": "server",
    "location": "Server Room D",
    "status": "online",
    "uptime": 99.9,
    "response_time": 10,
    "last_check": datetime.now().isoformat()
})
```

### Changing Refresh Interval

Edit the interval in `frontend/app.js`:

```javascript
function startAutoRefresh() {
    state.refreshInterval = setInterval(() => {
        refreshData();
    }, 5000); // Change 5000 to desired milliseconds
}
```

## Troubleshooting

### Backend won't start
- Ensure Python 3 is installed: `python --version`
- Ensure pip is installed: `pip --version`
- Install dependencies: `pip install -r requirements.txt`

### Frontend can't connect to API
- Make sure the backend server is running on port 5000
- Check browser console for CORS errors
- Verify the API URL in `frontend/app.js` matches your backend

### Charts not displaying
- Ensure Chart.js is loading (check browser console)
- Internet connection required for CDN-loaded Chart.js

## License

MIT License - Free to use for personal and commercial projects.

---

