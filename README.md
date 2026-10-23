# My App – Node.js + MongoDB (pre-Docker)

A tiny user-profile app to practice Docker with.

```
Browser (HTML/JS)  ->  Node/Express backend (port 3000)  ->  MongoDB (port 27017, db: my-db)
                                                              ^
                                              Mongo Express (port 8081) – DB admin UI
```

## Project structure

```
my-app/
├── package.json
├── server.js          # Express backend + MongoDB connection
└── public/
    └── index.html     # Frontend (HTML + vanilla JS)
```

## Configuration (environment variables)

| Variable    | Default                                   | Purpose            |
|-------------|-------------------------------------------|--------------------|
| `PORT`      | `3000`                                    | App port           |
| `MONGO_URL` | `mongodb://admin:password@localhost:27017`| MongoDB connection |
| `DB_NAME`   | `my-db`                                   | Database name      |

## Run it (before Docker)

1. Install dependencies:
   ```
   npm install
   ```
2. You need a MongoDB running on `localhost:27017` with user `admin` / password `password`.
   - Easiest: use the Docker course commands below once you reach that lesson.
   - Or install MongoDB locally and set `MONGO_URL` to match your setup, e.g. `mongodb://localhost:27017`.
3. Start the app:
   ```
   npm start
   ```
4. Open http://localhost:3000

## API

| Method | Path              | Description                |
|--------|-------------------|----------------------------|
| GET    | `/get-profile`    | Returns the stored profile |
| POST   | `/update-profile` | Creates/updates profile (JSON: `name`, `email`, `interests`) |
| GET    | `/health`         | Health check               |

## Docker steps to try later (for the course)

```
docker network create mongo-network

docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  --name mongodb --net mongo-network mongo

docker run -d -p 8081:8081 \
  -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin \
  -e ME_CONFIG_MONGODB_ADMINPASSWORD=password \
  -e ME_CONFIG_MONGODB_SERVER=mongodb \
  --net mongo-network --name mongo-express mongo-express
```

Then open Mongo Express at http://localhost:8081 and look for the `my-db` database after saving a profile.

Later exercises: write a `Dockerfile` for this app, then a `docker-compose.yml` for app + mongodb + mongo-express (when the app runs in a container, `MONGO_URL` must use the container name: `mongodb://admin:password@mongodb:27017`).
