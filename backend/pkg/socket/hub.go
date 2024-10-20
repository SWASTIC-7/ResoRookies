package socket

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dr4g0n369/testing/pkg/types"
	"github.com/gorilla/websocket"
)

// Hub manages the WebSocket connections for a particular chat room
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	Admin      *Client
	roomID     string
	Connected  map[string]*Client
	state      bool
}

// RoomManager keeps track of all the chat rooms (hubs)
type RoomManager struct {
	rooms map[string]*Hub
}

// RoomManager to handle multiple chat rooms
func NewRoomManager() *RoomManager {
	return &RoomManager{rooms: make(map[string]*Hub)}
}

// GetHub returns an existing hub or creates a new one if it doesn't exist
func (rm *RoomManager) GetHub(roomID string, isAdmin bool) *Hub {
	if hub, exists := rm.rooms[roomID]; exists {
		return hub
	}

	if isAdmin {
		newHub := NewHub(roomID)
		rm.rooms[roomID] = newHub
		go newHub.Run()
		return newHub
	}

	return nil
}

// Upgrader for WebSocket connections
var Upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// NewHub creates a new hub (chat room)
func NewHub(roomID string) *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		roomID:     roomID,
		Connected:  make(map[string]*Client),
		state:      false,
	}
}

// Run handles incoming events for the hub (register, unregister, broadcast)
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			h.Connected[client.user.Name] = client
			if client.user.IsAdmin {
				h.Admin = client
				client.Send <- []byte("You are the admin.")
			}
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				delete(h.Connected, client.user.Name)
				close(client.Send)
			}
		case message := <-h.broadcast:
			// Broadcast message to all clients
			for client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client)
				}
			}
		}
	}
}

var waitValue = 6
var waitTime = time.Duration(waitValue)
var startTime time.Time

func (h *Hub) BroadcastInit() {
	startTime = time.Now().Add(waitTime * time.Second)
	startTimeMessage := fmt.Sprintf("INIT %d", startTime.UnixMilli())
	h.broadcast <- []byte(startTimeMessage)
}

func (h *Hub) BroadcastStop() {
	startTimeMessage := "STOP"
	h.broadcast <- []byte(startTimeMessage)
}

func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request, user *types.User) {
	conn, err := Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	client := &Client{Hub: hub, Conn: conn, Send: make(chan []byte, 256), user: user}
	client.Hub.register <- client

	// Start pumps for reading and writing messages
	go client.writePump()
	go client.readPump()
}
