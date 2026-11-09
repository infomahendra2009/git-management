# Read Aloud Lessons (React + Node.js + Docker Compose)

Run:      docker compose up --build -d
Open:     http://localhost:8080  (Chrome or Edge)
Stop:     docker compose down
Logs:     docker compose logs -f
Delete saved data too: docker compose down -v

Lessons and results are kept in the "lessons-data" Docker volume.
Microphone works on localhost or on an HTTPS address only.
Language is British English (en-GB). Change it in client/src/App.jsx.
