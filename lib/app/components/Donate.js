import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import analytics from '../analytics';

class Donate extends React.Component {
  render() {
    return (
      <RaisedButton
        className="donate-button"
        label="Donate"
        secondary={true}
        linkButton={true}
        icon={<FontIcon className="material-icons">favorite_border</FontIcon>}
        onClick={analytics.trackEvent('Donate', 'Click')}
        href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=DNL9MGKS39BAJ"
        target="donate">
      </RaisedButton>
    );
  };
}

export default Donate;
