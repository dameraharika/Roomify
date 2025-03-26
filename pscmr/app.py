from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import sqlite3
import os
from io import BytesIO
import requests

app = Flask(__name__)


app = Flask(__name__)
CORS(app, origins=["http://127.0.0.1:5000", "http://localhost:5000"],allow_headers=["Content-Type"],
    methods=["GET", "POST", "OPTIONS"]) 

# Database connection function
def get_db_connection():
    conn = sqlite3.connect('epics.db')
    conn.row_factory = sqlite3.Row
    return conn

# Configuration for image upload and generation
UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads/images')
GENERATED_FOLDER = os.path.join(app.root_path, 'static/images/generated')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['GENERATED_FOLDER'] = GENERATED_FOLDER

# Ensure the directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(GENERATED_FOLDER, exist_ok=True)

# Load API key from environment variable
STABILITY_KEY = os.getenv('STABILITY_KEY', 'sk-GTESAdPFgd5TFCuKSFSBualgp3wVwzXorge5ZuXtsOosUipk')

@app.route('/items', methods=['GET'])
def get_items():
    room_type = request.args.get('room')
    cost_range = request.args.get('range')

    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT name, price_min, price_max, link
        FROM items
        WHERE room_type = ? AND cost_range = ?
    '''
    cursor.execute(query, (room_type, cost_range))
    items = cursor.fetchall()
    conn.close()
    
    if not items:
        return jsonify([]), 404

    items_list = [dict(item) for item in items]
    return jsonify(items_list)

def send_generation_request(host, params):
    headers = {
        "Accept": "image/*",
        "Authorization": f"Bearer {STABILITY_KEY}"
    }

    files = {}
    image = params.pop("image", None)
    if image is not None and image != '':
        files["image"] = image.read()

    response = requests.post(
        host,
        headers=headers,
        files=files,
        data=params
    )
    if not response.ok:
        raise Exception(f"HTTP {response.status_code}: {response.text}")

    return response

@app.route('/generate', methods=['POST'])
def generate():
    prompt = request.form['prompt']
    uploaded_file = request.files['image']
    
    if uploaded_file.filename == '':
        return 'No file uploaded', 400

    # Save the uploaded image
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], uploaded_file.filename)
    uploaded_file.save(image_path)

    params = {
        "control_strength": request.form.get('control_strength', '0.7'),
        "image": open(image_path, 'rb'),
        "seed": request.form.get('seed', '0'),
        "output_format": request.form.get('output_format', 'webp'),
        "prompt": prompt,
    }

    try:
        response = send_generation_request("https://api.stability.ai/v2beta/stable-image/control/sketch", params)
        output_image = response.content
        
        generated_image_path = os.path.join(app.config['GENERATED_FOLDER'], f'generated_image_{os.path.basename(image_path)}.webp')
        with open(generated_image_path, 'wb') as f:
            f.write(output_image)
        
        return send_file(BytesIO(output_image), mimetype='image/webp')
    except Exception as e:
        return str(e), 500

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # Change this line
