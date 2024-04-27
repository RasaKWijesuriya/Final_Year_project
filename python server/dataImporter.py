import json
from datetime import datetime
import pickle
import time
import firebase_admin
from firebase_admin import credentials, db
from google.oauth2.service_account import Credentials
import gspread
import traceback
from dotenv import load_dotenv
import os

load_dotenv()

FIREBASE_CREDS_PATH = 'firebase_credentials.json'
DATABASE_URL = os.getenv('FIREBASE_DATABASE_URL')
SOURCE_SPREADSHEET = os.getenv('SOURCE_SPREADSHEET')

cred = credentials.Certificate(FIREBASE_CREDS_PATH)
firebase_admin.initialize_app(cred, {'databaseURL': DATABASE_URL})

source_spreadsheet_url = SOURCE_SPREADSHEET

max_retries = 3
retry_delay_seconds = 1

retries = 0
while retries < max_retries:
    try:
        gc = gspread.service_account(filename='credentials.json')
        source_sh = gc.open_by_url(source_spreadsheet_url)
        source_worksheet = source_sh.get_worksheet(0)
        source_data = source_worksheet.get_all_values()

        for row in source_data[1:]:
            timestamp_str = row[0]
            data_index = row[1]
            sensor_data = row[2]

            root_ref = db.reference()

            new_data_ref = root_ref.child('source').push({
                'Timestamp': timestamp_str,
                'DataIndex': data_index,
                'SensorData': sensor_data
            })

        print("Data from Google Sheets has been inserted into Firebase Realtime Database.")
        print("______________________________________________________________________________")
        break

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        print(f"Retrying (attempt {retries + 1} of {max_retries})...")
        print("Exception traceback:", traceback.format_exc())
        time.sleep(retry_delay_seconds)
        retries += 1

if retries == max_retries:
    print(f"Maximum retries reached. Unable to complete the operation.")
    print("______________________________________________________________________________")

time.sleep(1)
