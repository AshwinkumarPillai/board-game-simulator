# Board Game Simulator

A full-stack Board Game Simulator application. This project consists of a backend server built with Node.js, Express, and WebSocket for real-time communication, and a frontend built with Next.js

## Table of Contents

- Description
- Features
- Tech Stack
- Installation
  - Backend Setup
  - Frontend Setup
- Environment Variables
- API Endpoints
- Socket Events
- Contributing

## Description

This project is a board game simulator that allows users to play board games online in real-time. The backend manages user authentication, game logic, and state, while the frontend provides a user interface for players to interact with.

## Features

- **User Authentication**: Register, login, and JWT-based authorization.
- **Game Logic**: Real-time handling of game phases, card dealing, and player actions.
- **Real-Time Communication**: Multiplayer support using WebSockets via Socket.io.
- **Game State Management**: Manage player states, game phases, and user actions.

## Tech Stack

### Frontend:

- Next.js
- Socket.io Client

### Backend:

- Node.js with Express (Typescript)
- MongoDB (Mongoose)
- JWT (for user authentication)
- Socket.io (for real-time communication)

## Installation

Follow the steps below to set up both the backend and frontend of the Board Game Simulator.

### Backend Setup

1. Clone the repository:

```bash
git clone https://github.com/AshwinkumarPillai/board-game-simulator.git
cd board-games-simulator
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Setup environment variables:

- Copy .env.example to .env:

```bash
cp .env.example .env
```

- Edit the .env file with the correct values for your environment

4. Run the backend server:

```bash
npm run dev
```

- The backend will run on http://localhost:5002

### Frontend Setup

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Setup environment variables:

- Copy .env.example to .env:

```bash
cp .env.example .env
```

- Edit the .env file with the correct values for your environment

3. Run the frontend server:

```bash
npm run dev
```

- The frontend will run on http://localhost:4001

## Environment Variables

Make sure to configure the following environment variables in both the frontend and backend .env files:

- JWT_SECRET
- MONGO_URI
- NEXT_PUBLIC_SOCKET_URL

## API Endpoints

### Authentication API

- `POST /api/user/register`: Register a new user.
- `POST /api/user/login`: Log in and receive a JWT token.

## Socket Events

### Server -> Client events

1. lobbyCreated – Emitted after a new lobby is successfully created.
2. lobbyUpdate – Sends updated lobby state (players, status, etc.).
3. lobbyJoined – Emitted when a user joins a lobby.
4. lobbyLeft – Emitted when a user leaves a lobby.
5. lobbyGameStarted – Indicates the game has started in the lobby.
6. validLobby – Confirms that the lobby ID provided is valid.
7. invalidLobby – Sent when the lobby ID provided is invalid or expired.
8. userIsInLobby – Informs the client that the user is currently in a lobby.
9. blackjack:betPlaced – Broadcasts a bet placed by a player.
10. blackjack:playerActionDone – Sent when a player completes their move (hit, stand, etc.).
11. blackjack:gameUpdated – Sends updated game state to all players.
12. data_error – Emitted when an invalid payload or unexpected data is received.

### Client -> Server events

1. createLobby – Request to create a new lobby.
2. joinLobby – Request to join an existing lobby.
3. leaveLobby – Request to leave the current lobby.
4. checkCurrentLobby – Asks the server if the user is currently in a lobby.
5. startLobbyGame – Requests the server to start the game in the lobby.
6. checkIfUserIsInAnyLobby – Checks if the user is in any lobby across sessions.
7. blackjack:makeBet – Sends a player's betting amount to the server.
8. blackjack:playerAction – Sends the player’s action (hit, stand, double, etc.).
9. blackjack:moveToNextRound – Request to initiate the next round after the current one ends.

## Contributing

We welcome contributions! If you'd like to contribute to the development of the Board Game Simulator, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push to your fork.
4. Open a pull request.
5. Please make sure to follow the coding standards and write tests for new features.
