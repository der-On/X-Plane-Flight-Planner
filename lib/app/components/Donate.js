import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

class Donate extends React.Component {
  render() {
    return (
      <RaisedButton
        className="donate-button"
        label="Donate"
        secondary={true}
        linkButton={true}
        icon={<FontIcon className="material-icons">favorite_border</FontIcon>}
        href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=DNL9MGKS39BAJ"
        target="donate">
      </RaisedButton>
    );
  };
}

export default Donate;
