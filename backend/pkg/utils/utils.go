package utils

import (
	"crypto/rand"
	"encoding/hex"
	"os"
	"path/filepath"
)

func GenerateRandomHex(n int) (string, error) {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// Function to scan the "songs" directory and return a list of song names
func GetSongsFromFolder(folderPath string) ([]string, error) {
	var songs []string
	err := filepath.Walk(folderPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// Only add regular files (i.e., songs)
		if !info.IsDir() {
			songs = append(songs, info.Name())
		}
		return nil
	})
	return songs, err
}
