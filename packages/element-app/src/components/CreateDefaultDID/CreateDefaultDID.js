import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';

export class CreateDefaultDID extends Component {
  handleCreate = () => {
    this.props.createDID();
  };

  render() {
    const { resolving } = this.props;

    if (resolving) {
      return <LinearProgress color="primary" variant="query" />;
    }

    return (
      <React.Fragment>
        <Button
          disabled={resolving}
          onClick={this.handleCreate}
          variant={'contained'}
          color={'secondary'}
        >
          Create DID
        </Button>
      </React.Fragment>
    );
  }
}

CreateDefaultDID.propTypes = {
  createDID: PropTypes.func.isRequired,
  resolving: PropTypes.any.isRequired,
};
