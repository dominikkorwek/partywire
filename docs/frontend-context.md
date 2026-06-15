# Frontend context

Project: Party Wire Game - a web-based party game.

Stack:
- Vite
- React
- TypeScript
- React Router
- plain CSS / CSS Modules
- do not add new libraries without asking first

Rules:
- Do not modify the backend unless explicitly requested.
- Keep TypeScript types in src/types.
- Keep page-level views in src/pages.
- Keep reusable components in src/components.
- Use src/services for REST API and WebSocket (STOMP) integration.
- Use PlayerContext for the current player session (sessionStorage).
- The UI should be dark, minimalistic, and use an orange accent color for primary actions.
- The code should be simple, readable, and aligned with backend DTOs.

Main screens:
- HomePage
- CreateRoomPage
- JoinRoomPage
- LobbyPage
- QuestionPage
- RoundResultsPage
- PodiumPage
- GameSummaryPage

Flow:
HomePage -> CreateRoomPage -> JoinRoomPage -> LobbyPage -> QuestionPage -> RoundResultsPage -> PodiumPage -> GameSummaryPage

Frontend responsibility:
- Connect to the backend REST API for room creation, joining, settings, and game actions.
- Subscribe to WebSocket updates for real-time lobby and game state.
- Display the game UI based on API responses and live updates.
- Use local component state only where needed.
- Avoid adding complex state management beyond PlayerContext.

Project notes:
- The host can create a game room.
- Guest players can join using a room code, invite link, or by scanning the QR code shown in the lobby.
- The lobby displays players, room settings, and a start game action.
- During the game, players answer questions.
- After each round, the app displays round results and the current ranking.
- At the end, the app displays the podium and the final game summary.
