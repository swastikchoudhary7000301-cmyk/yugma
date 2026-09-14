# Yugma

Yugma is a full-stack professional social networking platform inspired by community-first social feeds. It combines professional profiles, connections, posts, discussions, notifications and real-time messaging in a dark community UI.

## Stack

- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Socket.IO
- Lucide React

## Features

- Protected authentication and registration
- Professional profiles and profile editing
- Connections and connection requests
- Community-style feed
- Posts with images
- Voting/likes, saves and sharing
- Dedicated post discussions
- Comments, replies and comment likes
- Notifications
- Real-time chat foundation with Socket.IO
- Explore and user search
- Responsive dark UI

## Demo data

The server includes `seed:demo` for generating realistic development data. Configure `DEMO_OWNER_EMAIL` when needed, then run:

```bash
npm run seed:demo --prefix server
```

## Run locally

See `DEPLOYMENT.md` for setup and production deployment steps.
