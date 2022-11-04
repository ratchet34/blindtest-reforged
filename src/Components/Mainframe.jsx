import React, { useEffect, useRef, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { getVideoInfo } from 'youtube-video-exists';
import Buzzer from './Buzzer';
import './mainframe.css';
import Viewer from './Viewer';
import data from '../results.json';

function Mainframe({ websocketServerUrl }) {
  const [buzzers, setBuzzers] = useState([]);
  const [doneItems, setDoneItems] = useState([]);
  const [currItem, setCurrItem] = useState(null);
  const [nextItem, setNextItem] = useState(null);
  const [names, setNames] = useState([]);
  const [scores, setScores] = useState([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(websocketServerUrl, {
    shouldReconnect: () => true,
  });

  const viewerRef = useRef(null);

  const isOneBuzzed = (b) => b.some((buzzer) => buzzer.status === 'buzzed');
  const whichOneBuzzed = (b) => b.find((buzzer) => buzzer.status === 'buzzed');

  const findMyBuzzer = (b, id) => b.find((buzzer) => buzzer.id === id);

  const addNewBuzzer = (id) => {
    if (buzzers.some((b) => b.id === id)) return;
    setBuzzers((ps) => [...ps, { id, status: 'idle' }]);
  };

  const getNamesFromLocalStorage = () => {
    const localNames = window.localStorage.getItem('ubt-buzzer-names');
    setNames(JSON.parse(localNames));
  };

  const getScoresFromLocalStorage = () => {
    const localScores = window.localStorage.getItem('ubt-buzzer-scores');
    setScores(JSON.parse(localScores));
  };

  const setBuzzerName = (id, name) => {
    setNames((ps) => [...ps?.filter((b) => b.id !== id) ?? [], { id, name }]);
  };

  const changeBuzzerScore = (id, val) => {
    setScores((ps) => [...ps?.filter((b) => b.id !== id) ?? [],
      { id, score: (ps.find((b) => b.id === id)?.score ?? 0) + val }]);
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

  const resetAll = () => {
    setDoneItems([]);
    setScores([]);
    setCurrItem(null);
    getFirstItem();
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

  const getPlayerList = () => buzzers.map((b) => b.id);

  const getDoneItems = () => {
    const lsDone = localStorage.getItem('ubt-done-items');
    if (lsDone === null) return;
    setDoneItems(JSON.parse(lsDone));
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
    if ((names?.length ?? 0) === 0) return;
    window.localStorage.setItem('ubt-buzzer-names', JSON.stringify(names));
  }, [JSON.stringify(names)]);

  useEffect(() => {
    if ((scores?.length ?? 0) === 0) return;
    window.localStorage.setItem('ubt-buzzer-scores', JSON.stringify(scores));
  }, [JSON.stringify(scores)]);

  useEffect(() => {
    if ((doneItems?.length ?? 0) === 0) return;
    window.localStorage.setItem('ubt-done-items', JSON.stringify(doneItems));
  }, [JSON.stringify(doneItems)]);

  useEffect(() => {
    sendMessage(JSON.stringify({ type: 'item-to-admin', data: data?.[currItem] }));
  }, [currItem]);

  useEffect(() => {
    getDoneItems();
    getFirstItem();
    getNewItem();
    getNamesFromLocalStorage();
    getScoresFromLocalStorage();
  }, []);

  return (
    <div id="mainframe">
      {process.env.NODE_ENV !== 'production' && (
      <div>
        <button type="button" onClick={() => updateStatus(buzzers[0].id, 'buzzed')}>buzz 1</button>
        <button type="button" onClick={() => updateStatus(buzzers[1].id, 'buzzed')}>buzz 2</button>
      </div>
      )}
      <Viewer
        youtubeId={data?.[currItem]?.id}
        from={data?.[currItem]?.from}
        time={data?.[currItem]?.time}
        buzzed={isOneBuzzed(buzzers)}
        onValidate={onValidate}
        onNext={onNext}
        playerList={getPlayerList}
        scores={scores?.map((s) => ({
          id: s.id,
          score: s.score,
          name: names?.find((n) => n.id === s.id)?.name ?? s.id,
        }))}
        resetAll={resetAll}
        ref={viewerRef}
      />
      <div id="buzzer-container">
        {buzzers.map((b) => (
          <Buzzer
            key={uuid()}
            id={b.id}
            status={b.status}
            name={names?.find((n) => n.id === b.id)?.name ?? b.id}
            score={scores?.find((s) => s.id === b.id)?.score ?? 0}
            handleChangeName={setBuzzerName}
            handleChangeScore={changeBuzzerScore}
          />
        ))}
      </div>
    </div>
  );
}

Mainframe.propTypes = {
  websocketServerUrl: PropTypes.string.isRequired,
};

export default Mainframe;
