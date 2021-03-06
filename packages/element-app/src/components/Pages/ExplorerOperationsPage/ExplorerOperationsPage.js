import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Pages } from '../../index';
import { SidetreeOperation } from '../../SidetreeOperation';
import { DIDDocument } from '../../DIDDocument';

export class ExplorerOperationsPage extends Component {
  async componentWillMount() {
    if (this.props.match.params.didUniqueSuffix) {
      this.props.getOperationsForDidUniqueSuffix(this.props.match.params.didUniqueSuffix);
    }
  }

  render() {
    const { nodeStore, snackbarMessage } = this.props;
    const { sidetreeOperations, loading, didDocumentForOperations } = nodeStore;

    const content = () => {
      if (loading || !sidetreeOperations) {
        return <LinearProgress color="primary" variant="query" />;
      }
      return (
        <React.Fragment>
          {didDocumentForOperations && (
            <Grid item xs={12}>
              <DIDDocument
                didDocument={didDocumentForOperations}
                onCopyToClipboard={(item) => {
                  snackbarMessage({
                    snackbarMessage: {
                      message: `Copied ${item}`,
                      variant: 'success',
                      open: true,
                    },
                  });
                }}
              />
              <br />
            </Grid>
          )}
          {sidetreeOperations.map(op => (
            <Grid item xs={12} key={op.operation.operationHash}>
              <SidetreeOperation operation={op} expanded={false} />
              <br />
            </Grid>
          ))}
        </React.Fragment>
      );
    };
    return (
      <Pages.WithNavigation>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Typography variant="h3" style={{ marginBottom: '8px' }}>
              Element Operations
            </Typography>
            {content()}
          </Grid>
        </Grid>
      </Pages.WithNavigation>
    );
  }
}

ExplorerOperationsPage.propTypes = {
  nodeStore: PropTypes.object.isRequired,
  getOperationsForDidUniqueSuffix: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  snackbarMessage: PropTypes.func.isRequired,
};
