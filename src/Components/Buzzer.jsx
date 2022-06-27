import React from 'react';
import PropTypes from 'prop-types';
import './buzzer.css';

function Buzzer({ id, status }) {
  return (
    <div className="buzzer">
      {id}
      {status}
    </div>
  );
}

Buzzer.propTypes = {
  id: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
};

export default Buzzer;
