import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./landing/LandingPage";
import About from "./landing/About";
import JoinScreen from "./player/JoinScreen";
import CreateGame from "./host/CreateGame";
import LobbyView from "./host/LobbyView";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/join/:code" element={<JoinScreen />} />
      <Route path="/host/new" element={<CreateGame />} />
      <Route path="/host/lobby/:code" element={<LobbyView />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
