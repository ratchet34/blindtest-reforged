import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './buzzer.css';
import buzz from '../sounds/qpuc-buzz.mp3';

function Buzzer({ id, status = 'idle' }) {
  const getBuzzClass = (sta) => {
    if (sta === 'idle') return 'idle';
    if (sta === 'buzzed') return 'buzzed';
    if (sta === 'error') return 'error';
    throw new Error('no class was found for this status');
  };

  const getBuzzText = (sta) => {
    if (sta === 'idle') return 'Ready';
    if (sta === 'buzzed') return 'Buzzed !';
    if (sta === 'error') return 'Nope ! ';
    throw new Error('no class was found for this status');
  };

  const buzzSound = new Audio(buzz);

  const playBuzz = () => buzzSound.play();

  useEffect(() => {
    if (status === 'buzzed') playBuzz();
  }, [status]);

  return (
    <div className={`buzzer ${getBuzzClass(status)}`}>
      <p>{id}</p>
      <p>{getBuzzText(status)}</p>
    </div>
  );
}

Buzzer.propTypes = {
  id: PropTypes.string.isRequired,
  status: PropTypes.string,
};

Buzzer.defaultProps = {
  status: 'idle',
};

export default Buzzer;
