import React, { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Buzzer from './Buzzer';
import './mainframe.css';

function Mainframe() {
  const [buzzers, setBuzzers] = useState([]);
  const { sendMessage, lastMessage, readyState } = useWebSocket('ws://localhost:6969');

  const updateStatus = (id, status) => {
    const newBuzzers = [...buzzers];
    newBuzzers.find((buzz) => buzz.id === parseInt(id, 10)).status = status;
    setBuzzers(newBuzzers);
  };

  const handleClickButton = () => {
    sendMessage(JSON.stringify({ id: '1' }));
  };

  useEffect(() => {
    setBuzzers([
      { id: 1, status: 'idle' },
      { id: 2, status: 'idle' },
      { id: 3, status: 'idle' },
      { id: 4, status: 'idle' },
    ]);
  }, []);

  useEffect(() => {
    if (lastMessage !== null) {
      const pMess = JSON.parse(lastMessage.data);
      if (!pMess?.id || !pMess?.status) return;
      updateStatus(pMess.id, pMess.status);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN) sendMessage(JSON.stringify({ type: 'identification', id: '0' }));
  }, [readyState]);

  return (
    <div id="mainframe">
      <button type="button" onClick={handleClickButton} disabled={!readyState === ReadyState.OPEN}>Send message</button>
      <div id="buzzer-container">
        {buzzers?.[0] && <Buzzer id={buzzers[0].id} status={buzzers[0].status} />}
        {buzzers?.[1] && <Buzzer id={buzzers[1].id} status={buzzers[1].status} />}
        {buzzers?.[2] && <Buzzer id={buzzers[2].id} status={buzzers[2].status} />}
        {buzzers?.[3] && <Buzzer id={buzzers[3].id} status={buzzers[3].status} />}
      </div>
    </div>
  );
}

export default Mainframe;
