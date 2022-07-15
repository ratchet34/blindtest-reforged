import React, { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import PropTypes from 'prop-types';
import { Label } from 'semantic-ui-react';
import './admin.css';

function Admin({ websocketServerUrl }) {
  const [data, setData] = useState(null);
  const { sendMessage, lastMessage, readyState } = useWebSocket(websocketServerUrl, {
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (readyState === ReadyState.OPEN) sendMessage(JSON.stringify({ type: 'admin' }));
  }, [readyState]);

  useEffect(() => {
    if (lastMessage !== null) {
      const pMess = JSON.parse(lastMessage.data);
      setData(pMess);
    }
  }, [lastMessage]);
  return (
    <div className="admin-panel">
      {Object.entries(data ?? {}).map(([k, v]) => (
        <Label as="a" color="teal">
          {k}
          <Label.Detail>{v}</Label.Detail>
        </Label>
      ))}

    </div>
  );
}

Admin.propTypes = {
  websocketServerUrl: PropTypes.string.isRequired,
};

export default Admin;
