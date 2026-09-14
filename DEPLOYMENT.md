# Yugma deployment guide

## 1. Local setup

1. Copy `server/.env.example` to `server/.env` and fill in your MongoDB Atlas URI and JWT secret.
2. Copy `client/.env.example` to `client/.env`.
3. Install dependencies:

```powershell
npm install
cd server; npm install; cd ..
cd client; npm install; cd ..
```

4. Start both apps:

```powershell
npm run dev
```

## 2. Production architecture

- Frontend: Vercel (Vite build)
- Backend: Render/Railway/another Node host
- Database: MongoDB Atlas
- Media: Cloudinary when media credentials are configured

## 3. Frontend production variables

Set these in the frontend host:

- `VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api`
- `VITE_SOCKET_URL=https://YOUR-BACKEND-DOMAIN`

Build with:

```bash
npm run build
```

## 4. Backend production variables

Set:

- `PORT` (usually supplied by the host)
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL=https://YOUR-FRONTEND-DOMAIN`

Start with:

```bash
npm start
```

## 5. MongoDB Atlas

Add the backend host's outbound IP/network access according to the host's documentation. Never commit MongoDB credentials to Git.

## 6. Security

Use a new MongoDB database password and a new JWT secret for production. Do not reuse development secrets.
