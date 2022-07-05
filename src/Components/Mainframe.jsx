import React, { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuid } from 'uuid';
import Buzzer from './Buzzer';
import './mainframe.css';
import Viewer from './Viewer';
import data from '../results.json';

function Mainframe() {
  const [buzzers, setBuzzers] = useState([]);
  const [doneItems, setDoneItems] = useState([]);
  const [currItem, setCurrItem] = useState(null);
  const [nextItem, setNextItem] = useState(null);
  const { sendMessage, lastMessage, readyState } = useWebSocket('ws://localhost:6969');

  const isOneBuzzed = (b) => b.some((buzzer) => buzzer.status === 'buzzed');
  const whichOneBuzzed = (b) => b.find((buzzer) => buzzer.status === 'buzzed');

  const findMyBuzzer = (b, id) => b.find((buzzer) => buzzer.id === id);

  const addNewBuzzer = (id) => {
    if (buzzers.some((b) => b.id === id)) return;
    const newBuzzers = [...buzzers];
    newBuzzers.push({ id, status: 'idle' });
    setBuzzers(newBuzzers);
  };

  const updateStatus = (id, status) => {
    if (status === 'handshake') {
      addNewBuzzer(id);
      return;
    }
    if (status === 'buzzed' && isOneBuzzed(buzzers)) return;
    if (status === 'buzzed' && findMyBuzzer(buzzers, id)?.status === 'error') return;
    const newBuzzers = [...buzzers];
    newBuzzers.filter((b) => b.id !== id).forEach((buzz, i) => { newBuzzers[i].status = 'idle'; });
    newBuzzers.find((buzz) => buzz.id === id).status = status;
    setBuzzers(newBuzzers);
  };

  const resetBuzzers = () => {
    const newBuzzers = [...buzzers];
    newBuzzers.forEach((buzz, i) => { newBuzzers[i].status = 'idle'; });
    setBuzzers(newBuzzers);
  };

  const onValidate = (correct) => {
    if (buzzers.length === 0) return;
    updateStatus(whichOneBuzzed(buzzers).id, correct === true ? 'idle' : 'error');
  };

  const getFirstItem = () => {
    let newItem;
    do {
      newItem = Math.floor(Math.random() * data.length);
    } while (doneItems.includes(newItem));
    setCurrItem(newItem);
    setDoneItems([...doneItems, newItem]);
  };

  const getNewItem = () => {
    let newItem;
    do {
      newItem = Math.floor(Math.random() * data.length);
    } while (doneItems.includes(newItem));
    if (nextItem !== null) setCurrItem(nextItem);
    setNextItem(newItem);
    setDoneItems([...doneItems, newItem]);
  };

  const onNext = () => {
    resetBuzzers();
    getNewItem();
  };

  useEffect(() => {
    console.log(lastMessage);
    if (lastMessage !== null) {
      const pMess = JSON.parse(lastMessage.data);
      if (!pMess?.id || !pMess?.status) return;
      updateStatus(pMess.id, pMess.status);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN) sendMessage(JSON.stringify({ type: 'identification', id: '0' }));
  }, [readyState]);

  useEffect(() => {
    getFirstItem();
    getNewItem();
  }, []);

  return (
    <div id="mainframe">
      <button type="button" onClick={() => updateStatus(buzzers[0].id, 'buzzed')}>buzz 1</button>
      <button type="button" onClick={() => updateStatus(buzzers[1].id, 'buzzed')}>buzz 2</button>
      <Viewer
        youtubeId={data?.[currItem]?.id}
        from={data?.[currItem]?.from}
        buzzed={isOneBuzzed(buzzers)}
        onValidate={onValidate}
        onNext={onNext}
      />
      <div id="buzzer-container">
        {buzzers.map((b) => <Buzzer key={uuid()} id={b.id} status={b.status} />)}
      </div>
    </div>
  );
}

export default Mainframe;
