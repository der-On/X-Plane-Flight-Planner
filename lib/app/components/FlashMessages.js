import React from 'react';
import Snackbar from 'material-ui/Snackbar';
import { popFlashMessage } from '../state/actions';
import { FLASH_MESSAGE_DURATION } from '../constants';
import { connect } from 'react-redux';
import last from 'lodash/last';

class FlashMessages extends React.Component {
  handleRequestClose() {
    const { dispatch } = this.props;
    dispatch(popFlashMessage());
  }

  handleUndo() {
    const { flashMessages, dispatch } = this.props;
    const lastMessage = flashMessages.length ?
      last(flashMessages)
    : null;

    if (!lastMessage || !lastMessage.undo) return;

    dispatch(popFlashMessage());
    lastMessage.undo();
  }

  render() {
    const { flashMessages } = this.props;
    const lastMessage = flashMessages.length ?
      last(flashMessages)
    : null;

    return (
      <Snackbar
        open={flashMessages.length}
        message={lastMessage ? lastMessage.body : null}
        action={lastMessage && lastMessage.undo ? 'undo' : null}
        autoHideDuration={FLASH_MESSAGE_DURATION}
        onRequestClose={this.handleRequestClose.bind(this)}
        onActionTouchTap={this.handleUndo.bind(this)}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    flashMessages: state.flashMessages
  };
}

export default connect(mapStateToProps)(FlashMessages);
