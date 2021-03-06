import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Pages } from '../../index';
import { SidetreeTransaction } from '../../SidetreeTransaction';

export class ExplorerPage extends Component {
  componentWillMount() {
    // Only get the last 20 transactions to avoid crashing the page
    this.props.getSidetreeTransactions({ limit: 20 });
  }

  render() {
    const { nodeStore } = this.props;
    const { sidetreeTxns } = nodeStore;
    const prefix = this.props.fullNode ? '/server' : '/dapp';
    return (
      <Pages.WithNavigation>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Typography variant="h3" style={{ marginBottom: '8px' }}>
              Element Explorer
              {/* TODO: add menu for filtering. */}
              {/* eslint-disable-next-line */}
              {/* ?since=36&transaction-time-hash=0x5e496d4d60b2abd6326ec64298ba9be0bfbb89b5d804f5383381ebb65e8aaf8f */}
            </Typography>
          </Grid>

          {!sidetreeTxns ? (
            <Grid item xs={12}>
              <LinearProgress color="primary" variant="query" />
            </Grid>
          ) : (
            sidetreeTxns.map(transaction => (
              <Grid item xs={12} key={transaction.transactionNumber}>
                <SidetreeTransaction
                  transaction={transaction}
                  blockchain={'Ethereum'}
                  network={'ropsten'}
                  onClick={(transactionHash) => {
                    this.props.history.push(`${prefix}/transactions/${transactionHash}`);
                  }}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Pages.WithNavigation>
    );
  }
}

ExplorerPage.propTypes = {
  nodeStore: PropTypes.object.isRequired,
  getSidetreeTransactions: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  fullNode: PropTypes.object,
};
