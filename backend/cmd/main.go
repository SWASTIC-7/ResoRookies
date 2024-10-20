package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/dr4g0n369/testing/pkg/socket"
	"github.com/dr4g0n369/testing/pkg/types"
	"github.com/dr4g0n369/testing/pkg/utils"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

// GenerateRandomHex generates a random hex string for room ID

var mapAdmins = make(map[string]string)

func main() {
	roomManager := socket.NewRoomManager()

	// Create a new router using go-chi
	r := chi.NewRouter()

	// Use some middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.StripSlashes)
	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	fs := http.FileServer(http.Dir("songs"))
	r.Handle("/songs/*", http.StripPrefix("/songs/", fs))

	// Create room endpoint (POST /create_room)
	r.Post("/create_room", func(w http.ResponseWriter, r *http.Request) {
		var req types.RoomRequest
		json_encoder := json.NewEncoder(w)
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			json_encoder.Encode(types.Message{Status: "error", Message: "Invalid request"})
			return
		}

		roomID, err := utils.GenerateRandomHex(4) // 8-character hex string
		if err != nil {
			json_encoder.Encode(types.Message{Status: "error", Message: "Error generating room ID"})
			return
		}

		// Send the response with room ID and invite URL
		response := types.CreateRoomResponse{
			Status: "success",
			RoomID: roomID,
		}

		mapAdmins[roomID] = req.Username
		w.Header().Set("Content-Type", "application/json")
		json_encoder.Encode(response)

	})

	r.Get("/ws", func(w http.ResponseWriter, r *http.Request) {
		roomID := r.URL.Query().Get("room_id")
		username := r.URL.Query().Get("username")

		if roomID == "" || username == "" {
			http.Error(w, "Missing room_id or username", http.StatusBadRequest)
			return
		}

		var user *types.User
		if username == mapAdmins[roomID] {
			user = &types.User{Name: username, IsAdmin: true}
		} else {
			user = &types.User{Name: username, IsAdmin: false}
		}

		hub := roomManager.GetHub(roomID, user.IsAdmin)
		if hub == nil {
			http.Error(w, "Room not found", http.StatusNotFound)
			return
		}

		socket.ServeWs(hub, w, r, user)
	})

	r.Get("/start", func(w http.ResponseWriter, r *http.Request) {
		roomID := r.URL.Query().Get("room_id")
		username := r.URL.Query().Get("username")

		if roomID == "" || username == "" {
			json.NewEncoder(w).Encode(types.Message{Status: "error", Message: "Missing room_id or username"})
			return
		}

		if username != mapAdmins[roomID] {
			json.NewEncoder(w).Encode(types.Message{Status: "error", Message: "You are not the admin"})
			return
		}

		hub := roomManager.GetHub(roomID, false)
		if hub == nil {
			http.Error(w, "Room not found", http.StatusNotFound)
			return
		}

		hub.BroadcastInit()
		json.NewEncoder(w).Encode(types.Message{Status: "success", Message: "Broadcasted start time."})
	})

	r.Get("/stop", func(w http.ResponseWriter, r *http.Request) {
		roomID := r.URL.Query().Get("room_id")
		username := r.URL.Query().Get("username")

		if roomID == "" || username == "" {
			json.NewEncoder(w).Encode(types.Message{Status: "error", Message: "Missing room_id or username"})
			return
		}

		hub := roomManager.GetHub(roomID, false)
		if hub == nil {
			http.Error(w, "Room not found", http.StatusNotFound)
			return
		}

		if username != mapAdmins[roomID] {
			client, exists := hub.Connected[username]
			if exists {
				client.Send <- []byte("STOP")
			}

			json.NewEncoder(w).Encode(types.Message{Status: "error", Message: "You are not the admin"})
			return
		}

		hub.BroadcastStop()
		json.NewEncoder(w).Encode(types.Message{Status: "success", Message: "Broadcasted start time."})
	})

	r.Get("/sync", func(w http.ResponseWriter, r *http.Request) {
		roomID := r.URL.Query().Get("room_id")
		username := r.URL.Query().Get("username")

		if roomID == "" || username == "" {
			json.NewEncoder(w).Encode(types.Message{Status: "error", Message: "Missing room_id or username"})
			return
		}

		if username != mapAdmins[roomID] {

			hub := roomManager.GetHub(roomID, false)
			if hub == nil {
				http.Error(w, "Room not found", http.StatusNotFound)
				return
			}

			hub.Admin.Send <- []byte(fmt.Sprintf("SYNC %s false", username))

		}
		json.NewEncoder(w).Encode(types.Message{Status: "success", Message: "Synced."})
	})

	r.Get("/getsongs", func(w http.ResponseWriter, r *http.Request) {
		songs, err := utils.GetSongsFromFolder("songs")
		if err != nil {
			http.Error(w, "Error reading songs folder", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(types.SongList{Songs: songs})
	})

	// Start the HTTP server
	log.Println("Server started at :8080")
	err := http.ListenAndServe(":8080", r)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
