import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import PropTypes from 'prop-types';
import './viewer.css';
import { Button, Grid } from 'semantic-ui-react';

function Viewer({
  youtubeId, from, buzzed, onValidate, onNext,
}) {
  const [player, setPlayer] = useState();
  const [show, setShow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [testId, setTestId] = useState('');
  const [refresh, setRefresh] = useState(true);

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

  const onReady = (event) => {
    console.log('on ready');
    setPlayer(event.target);
    event.target.seekTo(from, true);
    // event.target.playVideo();
    setPlaying(true);
  };

  /* const onStateChange = (event) => {
    console.log(event.data);
    switch (event.data) {
      case -1:
        event.target.seekTo(from, true);
        event.target.playVideo();
        setPlaying(true);
        break;
      /* case 1:
        break;
      case 2:
        setPlaying(false);
        break;
      case 3:
        event.target.seekTo(from, true);
        event.target.playVideo();
        setPlaying(true);
        break;
      case 5:
        event.target.seekTo(from, true);
        event.target.playVideo();
        setPlaying(true);
        break;
      default:
        break;
    }
  }; */

  const handlePauseClick = () => {
    player.pauseVideo();
    setPlaying(false);
  };

  const handlePlayClick = () => {
    player.playVideo();
    setPlaying(true);
  };

  const handleRevealClick = () => setShow(!show);

  const handleCorrectValidateClick = () => {
    handlePlayClick();
    onValidate(true);
    setShow(true);
  };
  const handleWrongValidateClick = () => {
    handlePlayClick();
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
    console.log(youtubeId);
    setTestId(youtubeId);
    setRefresh(false);
  }, [youtubeId]);

  useEffect(() => {
    if (refresh === false) setRefresh(true);
  }, [refresh]);

  return (
    <div className="viewer">
      <div className="inner-screen">
        {refresh === true && (
        <YouTube
          className={`ytb-player ${testId}`}
          id={testId}
          videoId={testId}
          opts={opts}
          onReady={onReady}
          /* onStateChange={onStateChange} */
          style={{ display: show === true ? 'block' : 'none' }}
        />
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
    </div>
  );
}

Viewer.propTypes = {
  youtubeId: PropTypes.string,
  from: PropTypes.number,
  buzzed: PropTypes.bool,
  onValidate: PropTypes.func,
  onNext: PropTypes.func.isRequired,
};

Viewer.defaultProps = {
  youtubeId: '-50NdPawLVY',
  from: 0,
  buzzed: false,
  onValidate: () => {},
};

export default Viewer;
