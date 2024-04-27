import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv
import os

load_dotenv()

FIREBASE_CREDS_PATH = 'firebase_credentials.json'
DATABASE_URL = os.getenv('FIREBASE_DATABASE_URL')
DEST_NODE_NAME = 'dest'

cred = credentials.Certificate(FIREBASE_CREDS_PATH)
firebase_admin.initialize_app(cred, {'databaseURL': DATABASE_URL})

dest_node_name = DEST_NODE_NAME
dest_node = db.reference(dest_node_name)

# Delete all data under the 'dest' node
dest_node.delete()

print("All data under 'dest' node has been deleted.")
