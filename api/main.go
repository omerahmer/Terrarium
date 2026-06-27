package main

import (
	"bytes"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

// proxyTo returns a handler that forwards the request body to the AI service at
// the given path and streams the response straight back. Both /generate and
// /review are identical byte-passthrough proxies.
func proxyTo(path string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		aiURL := os.Getenv("AI_SERVICE_URL")
		if aiURL == "" {
			aiURL = "http://localhost:8000"
		}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "couldn't read body", http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		fullUrl := aiURL + path
		proxied, err := http.NewRequestWithContext(r.Context(), http.MethodPost, fullUrl, bytes.NewReader(body))
		if err != nil {
			http.Error(w, "failed to create request", http.StatusInternalServerError)
			return
		}

		proxied.Header = r.Header.Clone()
		proxied.Header.Set("Content-Type", "application/json")
		client := &http.Client{Timeout: 120 * time.Second}
		resp, err := client.Do(proxied)
		if err != nil {
			http.Error(w, "failed to POST", http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(resp.StatusCode)

		_, err = io.Copy(w, resp.Body)
		if err != nil {
			log.Println("failed to copy")
			return
		}
	}
}

func main() {
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))
	r.Use(middleware.Logger)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte("{\"status\": \"ok\",\"service\":\"go-api\"}"))
	})
	r.Post("/generate", proxyTo("/generate"))
	r.Post("/review", proxyTo("/review"))
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello world"))
	})
	http.ListenAndServe(":8080", r)
}
