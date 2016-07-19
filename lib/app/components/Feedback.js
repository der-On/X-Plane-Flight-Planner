import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

class Feedback extends React.Component {
  render() {
    return (
      <RaisedButton
        className="feedback-button"
        primary={true}
        icon={<FontIcon className="material-icons">mail_outline</FontIcon>}
        label="Feedback"
        linkButton={true}
        href={'mailto:info@anzui.de?subject=' + encodeURIComponent('Feedback for the new X-Plane Flight-Planner')}>
      </RaisedButton>
    );
  };
}

export default Feedback;
