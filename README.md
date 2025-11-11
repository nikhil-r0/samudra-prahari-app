**Samudra Prahari - Expo App with Offline Mesh Chat**

This is an Expo (React Native) application featuring a powerful, decentralized, peer-to-peer chat system that works entirely offline using Bluetooth Low Energy (BLE) mesh networking.

The mesh chat feature allows users to communicate in public or private channels without any internet connection or central server, making it ideal for remote areas, emergency situations, or any off-grid scenario.

---

### Core Features

* **Offline Peer-to-Peer Chat:** Send and receive messages with nearby users without Wi-Fi or cellular data.
* **BLE Mesh Networking:** Built on the expo-bitchat native module, which automatically discovers peers and relays messages.
* **Public Channels:** A default #general channel is available for all users on the network.
* **Encrypted Private Channels:** Create private channels where the channel name itself acts as the encryption/decrytion key. Only users who know the exact name can participate.
* **Persistent Nicknames:** Set a nickname that is saved locally to your device.
* **Manual Peer Discovery:** A "Refresh" button allows you to manually restart the BLE service to find new peers.
* **Cross-Platform:** Built with Expo for both iOS and Android.

---

### Technology Stack

* **Framework:** React Native (Expo SDK 50+)
* **Navigation:** Expo Router (v3)
* **Chat Core:** expo-bitchat (Native Module for BLE)
* **State Management:** React Context (ChatProvider)
* **Language:** TypeScript
* **Storage:** AsyncStorage (for nickname)

---

### Getting Started

#### 1. Prerequisites

* Node.js (LTS version)
* npm or yarn
* A physical Android or iOS device (Bluetooth features cannot be tested on simulators).
* Android Studio (for Android) or Xcode (for iOS) set up for React Native development.

#### 2. Installation

```bash
# Clone the repository
git clone [https://your-repository-url.git](https://your-repository-url.git)
cd your-project-name

# Install dependencies
npm install
```

#### 3. Running the App

This project uses native modules and cannot be run in the Expo Go app. You must build the development client.

```bash
# Build and run on Android
npx expo run:android

# Build and run on iOS
npx expo run:ios
```

---

### 🚀 How the Mesh Chat Works

The chat feature is a self-contained module within the `app/(tabs)/chat/` directory.

* **Nickname Setup:** The first time you open the "Mesh Chat" tab, you will be prompted to set a nickname. This is saved to your device's storage.
* **Service Start:** Once a nickname is set, the ChatProvider automatically starts the BitchatAPI service, which begins scanning for nearby peers over Bluetooth.
* **Joining Channels:**

  * `#general`: Tapping this button joins the public, unencrypted channel.
  * **Private Channel:** When you create a private channel (e.g., `#my-secret-room`), the channel name itself is used as the password to encrypt and decrypt all messages for that room.
* **Sending Messages:** Messages are sent to all connected peers. If a peer is in the same channel, they will see the message. If the channel is private, their app must also know the exact channel name (the key) to decrypt it.

---

### Key Project Files

* `app/(tabs)/chat/_layout.tsx`: The Stack navigator for the chat feature.
* `app/(tabs)/chat/index.tsx`: The main screen with nickname setup, channel list, and peer list.
* `app/(tabs)/chat/[channel].tsx`: The dynamic route for the chat room itself.
* `context/ChatProvider.tsx`: The "brain" of the chat system. It manages the BLE service, listeners, peers, and messages, and provides them to all chat screens via a React Context.

---

### 🚨 Essential Setup & Troubleshooting

Getting Bluetooth to work reliably requires specific permissions and settings.

#### 1. Required Permissions

The app must have the correct permissions to scan for and connect to Bluetooth devices. These are configured in `app.json`.

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          }
        }
      ]
    ],
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_ADVERTISE"
      ],
      "package": "com.yourcompany.yourapp"
    },
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSBluetoothAlwaysUsageDescription": "This app uses Bluetooth to find and connect to nearby devices for offline chat.",
        "NSBluetoothPeripheralUsageDescription": "This app uses Bluetooth to advertise its presence to nearby devices for offline chat.",
        "NSLocationWhenInUseUsageDescription": "This app uses location to find nearby Bluetooth devices."
      }
    }
  }
}
```

---

#### 2. Troubleshooting: "Peers Not Discovering"

This is the most common issue. If your app starts but you can't see any other users, follow these steps on all devices:

**Step 1: Enable Location Services**
On Android, apps must have the main system Location (GPS) turned on to perform Bluetooth scans. Pull down your quick settings and ensure the Location icon is active.

**Step 2: Disable Battery Optimization (Critical)**
Modern Android phones (especially newer ones) aggressively kill background services, including Bluetooth scanning, to save power. You must set the app's battery usage to **"Unrestricted."**

1. Go to your phone's **Settings.**
2. Tap on **Apps > See all apps.**
3. Find and tap on your app (**ProjectName**).
4. Tap on **Battery** or "App battery usage."
5. Select **"Unrestricted."**

**Step 3: Use the "Refresh" Button**
If you've confirmed the settings above, use the "Refresh" button on the main chat screen. This manually stops and restarts the BLE service, forcing a new scan for peers.

**Step 4: Check Hardware**
The expo-bitchat library and mesh networking perform best on devices with Bluetooth 5.0 or newer. Very old devices with Bluetooth 4.x may have unreliable performance or fail to connect.

---

### License

**MIT**

---
