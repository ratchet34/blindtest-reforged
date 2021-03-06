import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import PropTypes from 'prop-types';
import './viewer.css';
import {
  Button, Grid, Header, Label, Progress,
} from 'semantic-ui-react';
import cestnon from '../sounds/qpuc-cestnon.mp3';
import cestoui from '../sounds/kk-oui-oui-oui-oui-oui.mp3';

function Viewer({
  youtubeId, from, buzzed, onValidate, onNext, time, scores, resetAll,
}) {
  const [player, setPlayer] = useState();
  const [show, setShow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [tempId, setTempId] = useState('');
  const [refresh, setRefresh] = useState(true);
  const [currTime, setCurrTime] = useState(0);
  const [tick, setTick] = useState(0);

  const cestnonSound = new Audio(cestnon);
  const cestouiSound = new Audio(cestoui);

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
      controls: 0,
      showinfo: 0,
    },
  };

  const colors = [
    'green',
    'olive',
    'yellow',
    'orange',
    'red',
  ];

  const onReady = (event) => {
    console.log('on ready');
    setPlayer(event.target);
    event.target.seekTo(from, true);
    setPlaying(true);
  };

  const handlePauseClick = () => {
    player.pauseVideo();
    setPlaying(false);
  };

  const handlePlayClick = () => {
    player.playVideo();
    setPlaying(true);
  };

  cestnonSound.onended = handlePlayClick;
  cestouiSound.onended = handlePlayClick;

  const handleRevealClick = () => setShow(!show);

  const handleCorrectValidateClick = () => {
    cestouiSound.play();
    onValidate(true);
    setShow(true);
  };
  const handleWrongValidateClick = () => {
    cestnonSound.play();
    onValidate(false);
  };

  const handleNextClick = () => {
    onNext();
    setShow(false);
  };

  useEffect(() => {
    if (buzzed === true) {
      player.pauseVideo();
      setPlaying(false);
    }
  }, [buzzed]);

  useEffect(() => {
    setShow(false);
    setTempId(youtubeId);
    setRefresh(false);
    setCurrTime(time);
  }, [youtubeId]);

  useEffect(() => {
    if (refresh === false) setRefresh(true);
  }, [refresh]);

  useEffect(() => {
    if (playing === false) return;
    /* if (currTime === 1) {
      // setShow(true);
      return;
    } */
    if (currTime <= 0) return;
    setCurrTime((prevTime) => prevTime - 1);
  }, [tick]);

  useEffect(() => {
    const inter = setInterval(() => {
      setTick(Math.random());
    }, 1000);
    return () => clearInterval(inter);
  }, []);

  return (
    <div className="viewer">
      <div className="inner-screen">
        {refresh === true && (
        <YouTube
          className={`ytb-player ${tempId}`}
          id={tempId}
          videoId={tempId}
          opts={opts}
          onReady={onReady}
          /* onStateChange={onStateChange} */
          style={{ display: show === true ? 'block' : 'none' }}
        />
        )}
        {show === false && (
        <div className="progress-bar">
          <Header as="h1" style={{ color: 'white', textAlign: 'center' }}>{currTime}</Header>
          <Progress percent={Math.floor(100 * (currTime / time))} indicating />
        </div>
        )}
      </div>
      <div className="btn-panel">
        <Grid columns="two">
          <Grid.Row>
            <Grid.Column><Button primary={playing === true} icon="play" onClick={handlePlayClick} /></Grid.Column>
            <Grid.Column><Button primary={playing === false} icon="pause" onClick={handlePauseClick} /></Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column><Button icon={show === true ? 'eye slash' : 'eye'} onClick={handleRevealClick} /></Grid.Column>
            <Grid.Column><Button icon="step forward" onClick={handleNextClick} /></Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column><Button icon="check" disabled={buzzed === false} onClick={handleCorrectValidateClick} /></Grid.Column>
            <Grid.Column><Button icon="close" disabled={buzzed === false} onClick={handleWrongValidateClick} /></Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
      {scores && scores.length > 0 && (
      <div className="scores-panel">
        {scores.sort((a, b) => b.score - a.score).map((score, idx) => (
          <Label color={colors[idx < 4 ? idx : 4]}>
            {score.name.toString()}
            <Label.Detail>{score.score.toString()}</Label.Detail>
          </Label>
        ))}
      </div>
      )}
      <Button className="reset-btn" content="Reset" onClick={resetAll} />
    </div>
  );
}

Viewer.propTypes = {
  youtubeId: PropTypes.string,
  from: PropTypes.number,
  time: PropTypes.number,
  buzzed: PropTypes.bool,
  onValidate: PropTypes.func,
  onNext: PropTypes.func.isRequired,
  resetAll: PropTypes.func.isRequired,
  scores: PropTypes.arrayOf(PropTypes.shape),
};

Viewer.defaultProps = {
  youtubeId: '-50NdPawLVY',
  from: 0,
  time: 30,
  buzzed: false,
  onValidate: () => {},
  scores: [],
};

export default Viewer;
