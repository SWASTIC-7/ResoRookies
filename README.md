# 🎶 ResoRookies

ResoRookies is a real-time collaborative music player that allows users to listen to synchronized music across multiple devices. Built with WebSocket technology, it ensures that everyone in a group hears the same song at the same time, no matter where they are.

## 🌟 Features

- **Real-time Syncing**: Ensures all devices play the music in perfect synchronization.
- **Group Listening**: Multiple users can join a session and listen together.
- **Remote Control**: A master device controls playback, while all other devices follow in sync.
- **Cross-Device Compatibility**: Works on any device with a browser.
- **Easy to Use**: Simple and intuitive interface to start a synchronized music session.
  
## 🚀 Getting Started

### Technologies Used

- React
- A WebSocket server
- Golang

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SWASTIC-7/ResoRookies.git
   cd ResoRookies
   ```
2. Install Docker Compose
   ```bash
   docker compose up
   ```

3. Open your browser and navigate to `http://localhost`.

### Usage

1. Create a room and invite friends by sharing the room ID.
2. Select a song, and control the playback.
3. Enjoy the synchronized music experience!


## 📚 How It Works

1. **WebSocket Communication**: When a user starts playing a song, the server broadcasts the playback details (timestamp, song, etc.) to all connected devices.
2. **Real-Time Syncing**: Devices receive these details and adjust their local playback to ensure that all users are in sync.

## 💡 Future Enhancements

- Playlist Sharing
- User Profiles and Preferences
- Playing Multiple Songs
