from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os

app = Flask(__name__, static_folder='../frontend')
CORS(app)  # This will enable CORS for all routes

# Sample data to simulate database
users = [
    {
        "id": 1,
        "clerk_user_id": "user_123",
        "email": "student@example.com",
        "first_name": "Anisha",
        "last_name": "Sharma",
        "role": "student",
        "is_active": True
    },
    {
        "id": 2,
        "clerk_user_id": "user_456",
        "email": "tpo@example.com",
        "first_name": "Rajesh",
        "last_name": "Kumar",
        "role": "tpo",
        "is_active": True
    },
    {
        "id": 3,
        "clerk_user_id": "user_789",
        "email": "admin@example.com",
        "first_name": "Priya",
        "last_name": "Patel",
        "role": "admin",
        "is_active": True
    }
]

profiles = [
    {
        "id": 1,
        "user_id": 1,
        "phone": "+91 98765 43210",
        "degree": "B.Sc Computer Science",
        "year": "Final Year",
        "skills": "JavaScript, Python, React, Node.js, SQL",
        "about": "Passionate computer science student with expertise in web development. Seeking opportunities in software engineering.",
        "is_approved": True
    }
]

jobs = [
    {
        "id": 1,
        "title": "Software Engineer",
        "company": "TechCorp",
        "location": "Mumbai",
        "salary": "₹8-12 LPA",
        "posted": "2 days ago",
        "deadline": "2024-01-15",
        "type": "Full-time"
    },
    {
        "id": 2,
        "title": "Data Analyst",
        "company": "DataSystems",
        "location": "Pune",
        "salary": "₹6-10 LPA",
        "posted": "1 week ago",
        "deadline": "2024-01-20",
        "type": "Full-time"
    },
    {
        "id": 3,
        "title": "Marketing Intern",
        "company": "BrandMasters",
        "location": "Remote",
        "salary": "₹15,000/month",
        "posted": "3 days ago",
        "deadline": "2024-01-30",
        "type": "Internship"
    }
]

events = [
    {
        "id": 1,
        "title": "Resume Writing Workshop",
        "date": "2024-01-10",
        "time": "10:00 AM",
        "location": "Seminar Hall A"
    },
    {
        "id": 2,
        "title": "Mock Interview Session",
        "date": "2024-01-15",
        "time": "2:00 PM",
        "location": "Career Center"
    },
    {
        "id": 3,
        "title": "Industry Expert Talk",
        "date": "2024-01-20",
        "time": "4:00 PM",
        "location": "Auditorium"
    }
]

# API Routes
@app.route('/api/v1/users/clerk/<clerk_user_id>', methods=['GET'])
def get_user_by_clerk_id(clerk_user_id):
    for user in users:
        if user['clerk_user_id'] == clerk_user_id:
            return jsonify(user)
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/v1/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    for user in users:
        if user['id'] == user_id:
            return jsonify(user)
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/v1/users/<int:user_id>/profile', methods=['GET'])
def get_user_profile(user_id):
    for profile in profiles:
        if profile['user_id'] == user_id:
            return jsonify(profile)
    return jsonify({'error': 'Profile not found'}), 404

@app.route('/api/v1/jobs', methods=['GET'])
def get_jobs():
    return jsonify(jobs)

@app.route('/api/v1/events', methods=['GET'])
def get_events():
    return jsonify(events)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/', methods=['GET'])
def root():
    return send_from_directory(app.static_folder, 'index.html')

# Serve static files
@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # If file not found, try to serve index.html for SPA routing
        if path.endswith('.html') or '.' not in path:
            return send_from_directory(app.static_folder, 'index.html')
        else:
            return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    print("Starting PrepSphere API server...")
    print("Access the API at: http://localhost:8000")
    print("Access the frontend at: http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)