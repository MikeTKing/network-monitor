"""
Network Monitoring Dashboard - Backend API
A Flask application that simulates network device monitoring
for portfolio demonstration purposes.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import time
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Simulated network devices
DEVICES = [
    {
        "id": 1,
        "name": "Primary Router",
        "ip": "192.168.1.1",
        "type": "router",
        "location": "Server Room A",
        "status": "online",
        "uptime": 99.9,
        "response_time": 5,
        "last_check": datetime.now().isoformat()
    },
    {
        "id": 2,
        "name": "Core Switch",
        "ip": "192.168.1.2",
        "type": "switch",
        "location": "Server Room A",
        "status": "online",
        "uptime": 99.8,
        "response_time": 3,
        "last_check": datetime.now().isoformat()
    },
    {
        "id": 3,
        "name": "Web Server 01",
        "ip": "192.168.1.10",
        "type": "server",
        "location": "Server Room B",
        "status": "online",
        "uptime": 99.5,
        "response_time": 12,
        "last_check": datetime.now().isoformat()
    },
    {
        "id": 4,
        "name": "Database Server",
        "ip": "192.168.1.11",
        "type": "server",
        "location": "Server Room B",
        "status": "online",
        "uptime": 99.7,
        "response_time": 8,
        "last_check": datetime.now().isoformat()
    },
    {
        "id": 5,
        "name": "Firewall",
        "ip": "192.168.1.254",
        "type": "firewall",
        "location": "Network Edge",
        "status": "online",
        "uptime": 100.0,
        "response_time": 2,
        "last_check": datetime.now().isoformat()
    },
    {
        "id": 6,
        "name": "Backup Router",
        "ip": "192.168.2.1",
        "type": "router",
        "location": "Server Room C",
        "status": "online",
        "uptime": 98.5,
        "response_time": 15,
        "last_check": datetime.now().isoformat()
    },
    {
        "id": 7,
        "name": "Load Balancer",
        "ip": "192.168.1.100",
        "type": "loadbalancer",
        "location": "Server Room A",
        "status": "online",
        "uptime": 99.9,
        "response_time": 4,
        "last_check": datetime.now().isoformat()
    },
    {
        "id": 8,
        "name": "DNS Server",
        "ip": "192.168.1.53",
        "type": "server",
        "location": "Server Room B",
        "status": "online",
        "uptime": 99.6,
        "response_time": 6,
        "last_check": datetime.now().isoformat()
    }
]

# Alert history
ALERTS = []

# Response time history for charts
RESPONSE_HISTORY = {device["id"]: [] for device in DEVICES}


def simulate_device_status():
    """Simulate realistic device status changes"""
    for device in DEVICES:
        # Small random variation in response time
        base_response = device.get("_base_response", device["response_time"])
        device["_base_response"] = base_response
        variation = random.uniform(-2, 3)
        device["response_time"] = max(1, round(base_response + variation, 1))
        
        # Update uptime slightly
        uptime_variation = random.uniform(-0.1, 0.05)
        device["uptime"] = round(min(100, max(95, device["uptime"] + uptime_variation)), 2)
        
        # Update last check time
        device["last_check"] = datetime.now().isoformat()
        
        # Small chance of status change (for demo purposes)
        if random.random() < 0.02:  # 2% chance
            if device["status"] == "online":
                device["status"] = "warning"
                create_alert(device, "warning", f"High response time detected: {device['response_time']}ms")
            elif device["status"] == "warning":
                if random.random() < 0.5:
                    device["status"] = "online"
                    create_alert(device, "resolved", f"Device recovered - response time normalized")
                else:
                    device["status"] = "offline"
                    create_alert(device, "critical", f"Device went offline")
        
        # Store response time history
        RESPONSE_HISTORY[device["id"]].append({
            "time": datetime.now().isoformat(),
            "value": device["response_time"]
        })
        # Keep only last 20 data points
        if len(RESPONSE_HISTORY[device["id"]]) > 20:
            RESPONSE_HISTORY[device["id"]] = RESPONSE_HISTORY[device["id"]][-20:]


def create_alert(device, severity, message):
    """Create an alert entry"""
    alert = {
        "id": len(ALERTS) + 1,
        "device_id": device["id"],
        "device_name": device["name"],
        "device_ip": device["ip"],
        "severity": severity,
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "acknowledged": False
    }
    ALERTS.insert(0, alert)  # Add to beginning of list
    # Keep only last 50 alerts
    if len(ALERTS) > 50:
        ALERTS.pop()
    return alert


@app.route('/api/devices', methods=['GET'])
def get_devices():
    """Get all network devices"""
    simulate_device_status()
    return jsonify(DEVICES)


@app.route('/api/devices/<int:device_id>', methods=['GET'])
def get_device(device_id):
    """Get a specific device by ID"""
    device = next((d for d in DEVICES if d["id"] == device_id), None)
    if device:
        simulate_device_status()
        return jsonify(device)
    return jsonify({"error": "Device not found"}), 404


@app.route('/api/devices/<int:device_id>/history', methods=['GET'])
def get_device_history(device_id):
    """Get response time history for a device"""
    history = RESPONSE_HISTORY.get(device_id, [])
    return jsonify(history)


@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get all alerts"""
    severity = request.args.get('severity')
    if severity:
        filtered_alerts = [a for a in ALERTS if a["severity"] == severity]
        return jsonify(filtered_alerts)
    return jsonify(ALERTS)


@app.route('/api/alerts/<int:alert_id>/acknowledge', methods=['POST'])
def acknowledge_alert(alert_id):
    """Acknowledge an alert"""
    alert = next((a for a in ALERTS if a["id"] == alert_id), None)
    if alert:
        alert["acknowledged"] = True
        alert["acknowledged_at"] = datetime.now().isoformat()
        return jsonify({"message": "Alert acknowledged", "alert": alert})
    return jsonify({"error": "Alert not found"}), 404


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get overall network statistics"""
    simulate_device_status()
    
    total_devices = len(DEVICES)
    online_devices = sum(1 for d in DEVICES if d["status"] == "online")
    warning_devices = sum(1 for d in DEVICES if d["status"] == "warning")
    offline_devices = sum(1 for d in DEVICES if d["status"] == "offline")
    
    avg_response_time = round(sum(d["response_time"] for d in DEVICES) / total_devices, 2)
    avg_uptime = round(sum(d["uptime"] for d in DEVICES) / total_devices, 2)
    
    unacknowledged_alerts = sum(1 for a in ALERTS if not a["acknowledged"])
    
    return jsonify({
        "total_devices": total_devices,
        "online_devices": online_devices,
        "warning_devices": warning_devices,
        "offline_devices": offline_devices,
        "avg_response_time": avg_response_time,
        "avg_uptime": avg_uptime,
        "unacknowledged_alerts": unacknowledged_alerts,
        "total_alerts": len(ALERTS),
        "last_updated": datetime.now().isoformat()
    })


@app.route('/api/devices/by-type', methods=['GET'])
def get_devices_by_type():
    """Get devices grouped by type"""
    types = {}
    for device in DEVICES:
        device_type = device["type"]
        if device_type not in types:
            types[device_type] = []
        types[device_type].append(device)
    return jsonify(types)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })


if __name__ == '__main__':
    print("Starting Network Monitoring Dashboard API...")
    print("API will be available at http://localhost:5000")
    print("Press Ctrl+C to stop")
    app.run(debug=True, host='0.0.0.0', port=5000)