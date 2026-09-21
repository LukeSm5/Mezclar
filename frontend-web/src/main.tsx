import { createRoot } from 'react-dom/client';
import LobbyView from './host/LobbyView';
import { generateJoinCode } from './utils/lobby';
import './styles.css';

const demoJoinCode = generateJoinCode();

createRoot(document.getElementById('root')!).render(
  <LobbyView joinCode={demoJoinCode} />,
);
