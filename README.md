# Epee Scoring Machine

## Setup Guide

Download this repo:
```sh
git clone https://github.com/kerezsiz42/epee-scoring-machine
```

Change some constants according to your needs (network, server url):

```c
#define WIFI_SSID "your_network_ssid"
#define WIFI_PASSWORD "your_network_password"
#define SERVER_URL "http://your_server_ip:8080/button"
#define COLOR "red" // or "blue"
#define BUTTON_PIN 23
```

Download dependencies for node js project:

```sh
npm install
```

Then to start the server:

```sh
npm start
```

After that you will be able to open th website on your_ip:8080 in the browser.