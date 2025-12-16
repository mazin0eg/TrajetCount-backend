# TrajetCount Backend

Node/Express API for managing camions, remorques, pneus, trajets, users, and chauffeur/admin dashboards.

## Prerequisites
- Node.js 20+
- npm
- MongoDB instance (or use docker-compose provided)

## Environment
Create a `.env` (or use `env.example` as a template):
```
PORT=3000
MONGO_PATH=mongodb://localhost:27017/TrajetCount
ACCESS_TOKEN=your_jwt_secret
```

## Install & Run (local)
```bash
npm install
npm run dev
```
API served on `http://localhost:3000`.

## Docker
Build and run locally:
```bash
docker build -t trajetcount .
docker run -p 3000:3000 -e PORT=3000 -e MONGO_PATH="mongodb://<user>:<pass>@<host>:27017/<db>?authSource=admin" -e ACCESS_TOKEN=your_jwt_secret trajetcount
```

### Docker Compose
```bash
docker compose up --build
```
Services:
- api: http://localhost:3000
- mongo: port 27017, creds `test/test` (see compose file)

## Testing
```bash
npm test
```
Uses Jest + mongodb-memory-server.

## API Overview
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/camions`
- `GET/POST/PUT/DELETE /api/remorques`
- `GET/POST/PUT/DELETE /api/pneus`
- `GET/POST/PUT/DELETE /api/trajets` + start/complete/assign
- `GET /api/chauffeur/*` chauffeur endpoints
- `GET /api/admin/dashboard`

## Related Frontend
See the React frontend: https://github.com/mazin0eg/TrajetCount-frontend