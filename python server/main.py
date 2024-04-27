import json
from datetime import datetime
import pickle
import time
import firebase_admin
from firebase_admin import credentials, db
import traceback
from dotenv import load_dotenv
import os
import asyncio
import websockets
from flask import Flask, request, jsonify
import csv
from threading import Thread
from werkzeug.local import LocalProxy
from flask.signals import _signals
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from imblearn.under_sampling import RandomUnderSampler
from sklearn.preprocessing import LabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV
from flask_cors import CORS

load_dotenv()

FIREBASE_CREDS_PATH = 'firebase_credentials.json'
DATABASE_URL ='https://evaps-f8ff8-default-rtdb.firebaseio.com/'
SOURCE_NODE_NAME = 'source'
DEST_NODE_NAME = 'dest'

cred = credentials.Certificate(FIREBASE_CREDS_PATH)
firebase_admin.initialize_app(cred, {'databaseURL': DATABASE_URL})

app = Flask(__name__)

allowed_origins = "http://localhost:3000,https://x-project-design-system.vercel.app/".split(",")
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]

CORS(app, resources={r"/*": {"origins": allowed_origins}})

source_node_name = SOURCE_NODE_NAME
dest_node_name = DEST_NODE_NAME
source_node = db.reference(source_node_name)
dest_node = db.reference(dest_node_name)

normal_csv_counter = 1
error_csv_counter = 1

continuous_processing_flag = True
collect_thread = None

local_current_app = LocalProxy(lambda: app._get_current_object())
#self training process
async def process_data():
    previous_timestamp = None
    while True:
        try:
            latest_source_record = source_node.get()
            if latest_source_record:
                latest_source_record_key = max(latest_source_record, key=lambda x: datetime.strptime(latest_source_record[x]['Timestamp'], '%m/%d/%Y %H:%M:%S'))
                latest_source_record = latest_source_record[latest_source_record_key]
                
                timestamp_str = latest_source_record['Timestamp']
                timestamp = datetime.strptime(timestamp_str, '%m/%d/%Y %H:%M:%S')

                if timestamp != previous_timestamp:
                    previous_timestamp = timestamp

                    data_index = int(latest_source_record['DataIndex'])
                    sensor_data = [float(value) for value in latest_source_record['SensorData'].split('"')[1::2]]

                    print("Source Data:")
                    print(timestamp)
                    print(data_index)
                    print(sensor_data)

                    with open('predictor.pickle', 'rb') as model_file:
                        model = pickle.load(model_file)

                    prediction = model.predict([sensor_data])
                    prediction_list = prediction.tolist()
                    prediction_list_string = str(prediction_list).strip('[]')
                    print("Prediction:")
                    print(prediction_list_string)
                    PredValue = float(prediction_list_string.strip('"'))
                    PredString = "Good" if PredValue > 0.8 else "Old"

                    new_dest_row = {
                        'Timestamp': timestamp.strftime('%m/%d/%Y %H:%M:%S'),
                        'DataIndex': data_index,
                        'Prediction': PredString,
                        'SensorData': sensor_data
                    }
                    dest_node.push().set(new_dest_row)

                    result_data = {
                        'Timestamp': timestamp.strftime('%m/%d/%Y %H:%M:%S'),
                        'DataIndex': data_index,
                        'Prediction': PredString,
                        'SensorData': sensor_data
                    }

                    asyncio.ensure_future(send_data_to_clients(result_data))
                    print("Data has been processed.")
                    print("______________________________________________________________________________")

        except Exception as e:
            print("An error occurred:", str(e))
            print("______________________________________________________________________________")

        await asyncio.sleep(1)

connected_clients = set()

async def send_data_to_clients(data):
    to_remove = set()
    for websocket in connected_clients:
        if websocket.state == websockets.protocol.OPEN:
            try:
                await websocket.send(json.dumps(data))
            except websockets.exceptions.ConnectionClosedOK:
                to_remove.add(websocket)
        else:
            to_remove.add(websocket)

    for websocket in to_remove:
        connected_clients.remove(websocket)

    if to_remove:
        print("Disconnected clients removed.")
    print("Data has been sent to all connected clients.")
    print("______________________________________________________________________________")

connected_clients = set()

async def handle_client(websocket, path):
    connected_clients.add(websocket)
    print(f"Client connected: {websocket}")
    try:
        while True:
            await asyncio.sleep(1)
    except websockets.exceptions.ConnectionClosedOK:
        pass
    finally:
        connected_clients.remove(websocket)
        print(f"Client disconnected: {websocket}")

collecting_clients = set()

async def send_collecting_data_to_clients(data):
    to_remove = set()
    for websocket in collecting_clients:
        if websocket.state == websockets.protocol.OPEN:
            try:
                await websocket.send(json.dumps(data))
            except websockets.exceptions.ConnectionClosedOK:
                to_remove.add(websocket)
        else:
            to_remove.add(websocket)

    for websocket in to_remove:
        collecting_clients.remove(websocket)

    if to_remove:
        print("Disconnected collecting clients removed.")
    print("collecting data has been sent to all connected clients.")
    print("______________________________________________________________________________")

async def handle_collecting_client(websocket, path):
    collecting_clients.add(websocket)
    print(f"collecting client connected: {websocket}")
    try:
        while True:
            await asyncio.sleep(1)
    except websockets.exceptions.ConnectionClosedOK:
        pass
    finally:
        collecting_clients.remove(websocket)
        print(f"collecting client disconnected: {websocket}")
#data self training process
@app.route('/collect', methods=['POST'])
async def run_collecting_script():
    global continuous_processing_flag,normal_csv_counter,error_csv_counter, collect_thread

    data = request.get_json()
    label = data.get('type')

    print(data)

    if label == 'normal':
        csv_path = f'datacsv/normal/normal.csv'
    elif label == 'error':
        csv_path = f'datacsv/error/error.csv'
    else:
        return jsonify({"error": "Invalid label parameter. Use 'normal' or 'error'."})

    with open(csv_path, 'a', newline='') as csvfile:
        csv_writer = csv.writer(csvfile)
        if csvfile.tell() == 0:
            csv_writer.writerow(["time", "Acceleration_x", "Acceleration_y", "Acceleration_z", "Gyroscope_x", "Gyroscope_y", "Gyroscope_z", "magnetic_x", "magnetic_y", "magnetic_z"])

    def collect():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        with app.app_context():
            app.do_teardown_appcontext(_signals)

            previous_timestamp = None
            while continuous_processing_flag:
                try:
                    latest_source_record = source_node.get()
                    if latest_source_record:
                        latest_source_record_key = max(latest_source_record, key=lambda x: datetime.strptime(latest_source_record[x]['Timestamp'], '%m/%d/%Y %H:%M:%S'))
                        latest_source_record = latest_source_record[latest_source_record_key]

                        timestamp_str = latest_source_record['Timestamp']
                        timestamp = datetime.strptime(timestamp_str, '%m/%d/%Y %H:%M:%S')

                        if previous_timestamp is None or timestamp != previous_timestamp:
                            previous_timestamp = timestamp

                            data_index = int(latest_source_record['DataIndex'])
                            sensor_data = [float(value) for value in latest_source_record['SensorData'].split('"')[1::2]]

                            formatted_timestamp = timestamp.strftime('%H:%M:%S.%f')[:-3]
                            csv_line = f"{formatted_timestamp}, {', '.join(map(str, sensor_data))}"
                            
                            with open(csv_path, 'a', newline='') as csvfile:
                                csv_writer = csv.writer(csvfile)
                                csv_writer.writerow(csv_line.split(', '))

                            print(f"CSV data appended successfully ({label})")

                            result_data = {
                                'Timestamp': timestamp.strftime('%m/%d/%Y %H:%M:%S'),
                                'DataIndex': data_index,
                                'SensorData': sensor_data
                            }

                            result_json = json.dumps(result_data)

                            loop.run_until_complete(send_collecting_data_to_clients(json.loads(result_json)))

                except Exception as e:
                    print("An error occurred in run_collecting_script:", str(e))
                    return {"error": str(e)}

                time.sleep(1)

            loop.close()

        app.do_teardown_appcontext(_signals)


    collect_thread = Thread(target=collect)
    collect_thread.start()

    return jsonify({"message": "collecting started."})
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Extract sensor data from the request
        data = request.get_json()
        sensor_data = [[ 
            data.get('Acceleration_x'),
            data.get('Acceleration_y'),
            data.get('Acceleration_z'),
            data.get('Gyroscope_x'),
            data.get('Gyroscope_y'),
            data.get('Gyroscope_z'),
            data.get('magnetic_x'),
            data.get('magnetic_y'),
            data.get('magnetic_z')]
        ]
        print('Sensor Data:', sensor_data)

        # Load the trained model
        with open('predictor.pickle', 'rb') as model_file:
            model = pickle.load(model_file)

        # Make prediction using the loaded model
        prediction = model.predict(sensor_data)
        prediction_label = prediction[0]
        print('Prediction:', prediction_label)

        # Convert prediction to label
        if prediction_label == 1:
            prediction_text = 'Good'
        else:
            prediction_text = 'Bad'

        # Prepare response
        response_data = {
            'prediction': prediction_text
        }

        # pass prediction data to FE
        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)})

    
if __name__ == '__main__':
    start_processing_data = asyncio.ensure_future(process_data())
    start_server = websockets.serve(handle_client, "0.0.0.0", 4000)
    start_collecting_server = websockets.serve(handle_collecting_client, "0.0.0.0", 4050)

    from threading import Thread
    flask_thread = Thread(target=app.run, kwargs={'host': '0.0.0.0', 'port': 3050})
    flask_thread.start()

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_until_complete(start_collecting_server)
    asyncio.get_event_loop().run_until_complete(start_processing_data)
    asyncio.get_event_loop().run_forever()
