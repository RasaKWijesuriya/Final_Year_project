const express = require('express');
const cors = require('cors'); // Import the cors function
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define MongoDB connection URI
const mongoURI = 'mongodb+srv://user:user123@cluster0.bfyh8qu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Change this to your MongoDB URI

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Define data schema
const dataSchema = new Schema({
    accelx: Number,
    accely: Number,
    accelz: Number,
    gyrox: Number,
    gyroy: Number,
    gyroz: Number,
    magx: Number,
    magy: Number,
    magz: Number,
    timestamp: { type: Date, default: Date.now }
});

// Create a model from the schema
const Data = mongoose.model('data', dataSchema);

// Define data schema
const predictDataSchema = new Schema({
    accelx: Number,
    accely: Number,
    accelz: Number,
    gyrox: Number,
    gyroy: Number,
    gyroz: Number,
    magx: Number,
    magy: Number,
    magz: Number,
    prediction:String,
    timestamp: { type: Date, default: Date.now }
});

// Create a model from the schema
const PredictData = mongoose.model('predictData', predictDataSchema);

const app = express();
//running app port
const port = 8070;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Endpoint to handle GET requests from the ESP32
//ESP32 fetching data directly to this API
app.get('/update', async (req, res) => {
    try {
        // Retrieve data from the query parameters
        const { accelx, accely, accelz, gyrox, gyroy, gyroz, magx, magy, magz } = req.query;

        // Log the received data
        console.log('================================');
        console.log('Received data:');
        console.log('Accelerometer X:', accelx);
        console.log('Accelerometer Y:', accely);
        console.log('Accelerometer Z:', accelz);
        console.log('Gyroscope X:', gyrox);
        console.log('Gyroscope Y:', gyroy);
        console.log('Gyroscope Z:', gyroz);
        console.log('Magnetometer X:', magx);
        console.log('Magnetometer Y:', magy);
        console.log('Magnetometer Z:', magz);
        console.log('================================');


        // Create a new data instance
        const newData = new Data({
            accelx,
            accely,
            accelz,
            gyrox,
            gyroy,
            gyroz,
            magx,
            magy,
            magz
        });

        // Save the data to MongoDB
        await newData.save();

        // Respond with a success message
        res.send('Data stored successfully in MongoDB');
    } catch (error) {
        console.error('Error storing data in MongoDB:', error);
        res.status(500).send('Error storing data in MongoDB');
    }
});

app.post('/addtohistory', async (req, res) => {
    try {
        // Retrieve data from the query parameters
        console.log(req.body)
        const { accelx, accely, accelz, gyrox, gyroy, gyroz, magx, magy, magz ,prediction} = req.body;

        // Log the received data
        console.log('================================');
        console.log('Predicted data:');
        console.log('Accelerometer X:', accelx);
        console.log('Accelerometer Y:', accely);
        console.log('Accelerometer Z:', accelz);
        console.log('Gyroscope X:', gyrox);
        console.log('Gyroscope Y:', gyroy);
        console.log('Gyroscope Z:', gyroz);
        console.log('Magnetometer X:', magx);
        console.log('Magnetometer Y:', magy);
        console.log('Magnetometer Z:', magz);
        console.log('prediction:', prediction);
        console.log('================================');


        // Create a new data instance
        const newData = new PredictData({
            accelx,
            accely,
            accelz,
            gyrox,
            gyroy,
            gyroz,
            magx,
            magy,
            magz,
            prediction
        });

        // Save the data to MongoDB
        await newData.save();

        // Respond with a success message
        res.send('Data stored successfully in MongoDB');
    } catch (error) {
        console.error('Error storing data in MongoDB:', error);
        res.status(500).send('Error storing data in MongoDB');
    }
});

// Endpoint to retrieve data from MongoDB and send it to the client = frontend
app.get('/data', async (req, res) => {
    try {
        // Fetch data from MongoDB
        const data = await Data.findOne().sort({ timestamp: -1 });

        // Send the data as JSON response
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from MongoDB:', error);
        res.status(500).send('Error fetching data from MongoDB');
    }
});

app.get('/all', async (req, res) => {
    try {
        // Fetch data from MongoDB
        const predictData = await PredictData.find();

        // Send the data as JSON response
        res.json(predictData);
    } catch (error) {
        console.error('Error fetching data from MongoDB:', error);
        res.status(500).send('Error fetching data from MongoDB');
    }
});

// Start the server
//ESP32 captured data send to this (port)server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
