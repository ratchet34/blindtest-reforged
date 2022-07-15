import React from 'react';
import './App.css';
import Mainframe from './Components/Mainframe';
import Admin from './Components/Admin';

function App() {
  const websocketServerUrl = process.env.REACT_APP_WEBSOCKET_SERVER_ADDRESS ?? 'ws://localhost:6969';
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');

  console.log(websocketServerUrl);

  return (
    <div className="App">
      {mode !== 'admin' && <Mainframe websocketServerUrl={websocketServerUrl} />}
      {mode === 'admin' && <Admin websocketServerUrl={websocketServerUrl} />}
    </div>
  );
}

export default App;
