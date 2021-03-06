// core
import React from 'react';

// css
import './stylesheet.css';

const Info = (props: any): JSX.Element => { // temp

  console.log('info', props)

  return (
          <div className="player_info border-gradient-grey">
            { props.playerName}
          </div>
  );

}

export default Info;