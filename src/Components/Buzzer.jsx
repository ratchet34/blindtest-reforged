/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './buzzer.css';
import { Button, Input, Modal } from 'semantic-ui-react';
import buzz from '../sounds/qpuc-buzz.mp3';

function Buzzer({
  id, name, handleChangeName, handleChangeScore, score, status = 'idle',
}) {
  const [modal, setModal] = useState(false);
  const [inputName, setInputName] = useState('');

  const getBuzzClass = (sta) => {
    if (sta === 'idle') return 'idle';
    if (sta === 'buzzed') return 'buzzed';
    if (sta === 'error') return 'error';
    throw new Error('no class was found for this status');
  };

  const buzzSound = new Audio(buzz);

  const playBuzz = () => buzzSound.play();

  useEffect(() => {
    if (status === 'buzzed') playBuzz();
  }, [status]);

  return (
    <div className={`buzzer ${getBuzzClass(status)}`}>
      <p onClick={() => setModal(true)}>{name !== '' ? name : id}</p>
      <div className="score-btns">
        <Button color="red" icon="minus" onClick={() => handleChangeScore(id, -1)} />
        <p>{score}</p>
        <Button color="green" icon="plus" onClick={() => handleChangeScore(id, 1)} />
      </div>
      <Modal onClose={() => setModal(false)} open={modal === true}>
        <Modal.Header>New name</Modal.Header>
        <Modal.Content>
          <Input value={inputName} onChange={(e, { value }) => setInputName(value)} />
        </Modal.Content>
        <Modal.Actions>
          <Button
            positive
            content="OK"
            onClick={() => {
              handleChangeName(id, inputName);
              setModal(false);
            }}
          />
        </Modal.Actions>
      </Modal>
    </div>
  );
}

Buzzer.propTypes = {
  id: PropTypes.string.isRequired,
  status: PropTypes.string,
  name: PropTypes.string,
  score: PropTypes.number,
  handleChangeName: PropTypes.func,
  handleChangeScore: PropTypes.func,
};

Buzzer.defaultProps = {
  status: 'idle',
  name: '',
  score: 0,
  handleChangeName: () => {},
  handleChangeScore: () => {},
};

export default Buzzer;
