package types

type Message struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

// type User struct {
// 	User string `json:"user"`
// 	Room string `json:"room"`
// }

type User struct {
	Name    string
	IsAdmin bool
}

type CreateRoomResponse struct {
	Status string `json:"status"`
	RoomID string `json:"room_id"`
}

type RoomRequest struct {
	Username string `json:"username"`
}

type JoinRoomRequest struct {
	Username string `json:"username"`
	RoomID   string `json:"room_id"`
}

type SongList struct {
	Songs []string `json:"songs"`
}
