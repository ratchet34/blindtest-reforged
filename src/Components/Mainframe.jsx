import React, { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuid } from 'uuid';
import { getVideoInfo } from 'youtube-video-exists';
import Buzzer from './Buzzer';
import './mainframe.css';
import Viewer from './Viewer';
import data from '../results.json';

function Mainframe() {
  const [buzzers, setBuzzers] = useState([]);
  const [doneItems, setDoneItems] = useState([]);
  const [currItem, setCurrItem] = useState(null);
  const [nextItem, setNextItem] = useState(null);
  const websocketServerUrl = process.env.REACT_APP_WEBSOCKET_SERVER_ADDRESS ? process.env.REACT_APP_WEBSOCKET_SERVER_ADDRESS : 'ws://localhost:6969';
  const { sendMessage, lastMessage, readyState } = useWebSocket(websocketServerUrl, {
    shouldReconnect: () => true,
  });

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
    newBuzzers.forEach((buzz, i) => { if (buzz.id !== id) newBuzzers[i].status = 'idle'; });
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

  const getNotDoneItem = async () => {
    const notDoneItems = data.filter((d, idx) => !doneItems.includes(idx));
    let newItem;
    let check;
    do {
      newItem = data.map((d) => d.id)
        .indexOf(notDoneItems[Math.floor(Math.random() * notDoneItems.length)].id);
      console.log(newItem);
      // eslint-disable-next-line no-await-in-loop
      check = await getVideoInfo(data[newItem].id);
      console.log({ check, doneItems });
    } while (doneItems.includes(newItem)
      || check.existing === false
      || check.validId === false
      || check.private === true);
    return newItem;
  };

  const getFirstItem = async () => {
    const newItem = await getNotDoneItem();
    setCurrItem(newItem);
    setDoneItems([...doneItems, newItem]);
  };

  const getNewItem = async () => {
    const newItem = await getNotDoneItem();
    if (nextItem !== null) setCurrItem(nextItem);
    setNextItem(newItem);
    setDoneItems([...doneItems, newItem]);
  };

  const onNext = () => {
    resetBuzzers();
    getNewItem();
  };

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
        time={data?.[currItem]?.time}
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
