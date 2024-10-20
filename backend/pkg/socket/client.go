package socket

import (
	"bytes"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/dr4g0n369/testing/pkg/types"
	"github.com/gorilla/websocket"
)

// Client represents a WebSocket client connected to the server
type Client struct {
	Hub  *Hub
	Conn *websocket.Conn
	Send chan []byte
	user *types.User
}

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

func (c *Client) readPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()
	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}
		// c.hub.broadcast <- message

		message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
		c.handleMessage(message)

	}
}

// Refactored message handler for clarity
func (c *Client) handleMessage(message []byte) {
	switch {
	case bytes.HasPrefix(message, []byte("SYNC")):
		c.handleSync(message)
	case bytes.HasPrefix(message, []byte("JOINED")):
		c.handleJoin(message)
	case bytes.HasPrefix(message, []byte("SET")):
		c.handleState(message)
	case bytes.HasPrefix(message, []byte("CLOSE")):
		if c.user.IsAdmin {
			c.Hub.BroadcastStop()
		}
	default:
		c.handleDelay(message)
	}
}

// Handle SET logic in its own function
func (c *Client) handleState(message []byte) {
	if !c.user.IsAdmin {
		log.Println("Non-admin user cannot send SET messages")
		return
	}
	parts := strings.Split(string(message), " ")
	if len(parts) < 2 {
		log.Println("Invalid SET message format")
		return
	}

	c.Hub.state = parts[1] == "true"
}

func (c *Client) handleJoin(message []byte) {
	parts := strings.Split(string(message), " ")
	if len(parts) < 2 {
		log.Println("Invalid JOINED message format")
		return
	}

	c.Hub.Admin.Send <- []byte(fmt.Sprintf("SYNC %s %t", parts[1], c.user.IsAdmin))

}

// Handle SYNC logic in its own function
func (c *Client) handleSync(message []byte) {
	if !c.Hub.state {
		log.Println("Admin is paused")
		return
	}
	parts := strings.Split(string(message), " ")
	if len(parts) < 4 {
		log.Println("Invalid SYNC message format")
		return
	}

	targetClient, exists := c.Hub.Connected[parts[3]]
	if exists {
		targetClient.Send <- []byte(fmt.Sprintf("RANDOM %s %s", parts[1], parts[2]))
	} else {
		log.Printf("Target client %s not found for sync", parts[3])
	}
}

// Handle delay adjustment for start time
func (c *Client) handleDelay(message []byte) {
	delay, err := strconv.Atoi(string(message))
	if err != nil {
		log.Println("Invalid delay value:", err)
		return
	}

	delay -= waitValue * 1000
	correctedStart := startTime.UnixMilli() - int64(delay)
	c.Send <- []byte(fmt.Sprintf("START %d", correctedStart))
}

func (c *Client) writePump() {
	ticker := time.NewTicker(10 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			c.Conn.WriteMessage(websocket.TextMessage, message)
		case <-ticker.C:
			c.Conn.WriteMessage(websocket.PingMessage, nil)
		}
	}
}
