import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateRoomPage from './pages/CreateRoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import LobbyPage from './pages/LobbyPage';
import QuestionPage from './pages/QuestionPage';
import RoundResultsPage from './pages/RoundResultsPage';
import PodiumPage from './pages/PodiumPage';
import GameSummaryPage from './pages/GameSummaryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-room" element={<CreateRoomPage />} />
        <Route path="/join" element={<JoinRoomPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/game/question" element={<QuestionPage />} />
        <Route path="/game/results" element={<RoundResultsPage />} />
        <Route path="/game/podium" element={<PodiumPage />} />
        <Route path="/game/summary" element={<GameSummaryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
