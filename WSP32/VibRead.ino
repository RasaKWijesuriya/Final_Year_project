#include <Wire.h>
#include <MPU9250.h> 
#include <WiFi.h>

const char* ssid = "Dialog 4G 216";
const char* password = "9eE8579D";
const char* serverIP = "192.168.8.118";

WiFiClient client;

MPU9250 mpu;

float rawValues[9];

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected");
  
  Wire.begin();
  
  if (!mpu.setup(0x68)) {
    while (1) {
      Serial.println("MPU connection failed");
      delay(1000);
    }
  }
  
  // Initialize rawValues array
  for (int i = 0; i < 9; i++) {
    rawValues[i] = 0.00;
  }
}

void loop() {
  if (mpu.update()) {
    get_calibrated_accel(rawValues);
    get_calibrated_gyro(rawValues);
    get_calibrated_mag(rawValues);
    
    // Send data over WiFi
    if (client.connect(serverIP, 8070)) {
      client.print("GET /update?accelx=");
      client.print(rawValues[0]);
      client.print("&accely=");
      client.print(rawValues[1]);
      client.print("&accelz=");
      client.print(rawValues[2]);
      client.print("&gyrox=");
      client.print(rawValues[3]);
      client.print("&gyroy=");
      client.print(rawValues[4]);
      client.print("&gyroz=");
      client.print(rawValues[5]);
      client.print("&magx=");
      client.print(rawValues[6]);
      client.print("&magy=");
      client.print(rawValues[7]);
      client.print("&magz=");
      client.print(rawValues[8]);
      client.println(" HTTP/1.1");
      client.println("Host: server_ip");
      client.println("Connection: close");
      client.println();
      Serial.println(String(rawValues[0]) + "," + String(rawValues[1]) + "," + String(rawValues[2]) + "," + String(rawValues[3]) + "," + String(rawValues[4]) + "," + String(rawValues[5]) + "," + String(rawValues[6]) + "," + String(rawValues[7]) + "," + String(rawValues[8]));

      delay(1000); // Adjust delay between data transmissions
    }
    else {
      Serial.println("Failed to connect to server");
    }
  }
  
  delay(10); // Delay between loop iterations
}

void get_calibrated_accel(float* floatValues) {
  floatValues[0] = mpu.getAccX() - 0.04;
  floatValues[1] = mpu.getAccY() - 0.04;
  floatValues[2] = mpu.getAccZ() - 0.91;
}

void get_calibrated_gyro(float* floatValues) {
  floatValues[3] = mpu.getGyroX() + 0.00;
  floatValues[4] = mpu.getGyroY() + 0.00;
  floatValues[5] = mpu.getGyroZ() + 0.00;
}

void get_calibrated_mag(float* floatValues) {
  floatValues[6] = mpu.getMagX() * 1.00; 
  floatValues[7] = mpu.getMagY() * 1.00;
  floatValues[8] = mpu.getMagZ() * 1.00;
}
