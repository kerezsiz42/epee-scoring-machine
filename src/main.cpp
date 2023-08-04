#include <Arduino.h>
#include <WiFiClient.h>
#include <WiFi.h>
#include <HTTPClient.h>

#define WIFI_SSID "Hotspot"
#define WIFI_PASSWORD "asdf1234"
#define SERVER_URL "http://192.168.189.45:8080/button"
#define COLOR "red"
#define BUTTON_PIN 23

WiFiClient client;
HTTPClient http;
unsigned long start_time = millis();

void setup()
{
  Serial.begin(9600);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("\nConnecting to WiFi..");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.print(".");
  }
  Serial.print("\nSSID: ");
  Serial.println(WiFi.SSID());
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Signal strength (RSSI): ");
  Serial.print(WiFi.RSSI());
  Serial.println("dBm");
  pinMode(BUTTON_PIN, INPUT);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
}

void loop()
{
  if (!digitalRead(BUTTON_PIN))
  {
    start_time = millis();
    return;
  }
  if (start_time + 14 > millis())
  {
    return;
  }
  if (WiFi.status() == WL_CONNECTED)
  {
    http.begin(client, SERVER_URL);
    http.addHeader("X-Color", COLOR);
    int responseCode = http.GET();
    if (responseCode > 0)
    {
      Serial.print("HTTP Response code: ");
      Serial.println(responseCode);
    }
    http.end();
    start_time = millis();
  }
}