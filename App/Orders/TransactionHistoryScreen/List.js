import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { gotoEtherScan } from '../../../thunks';
import { transactionProp } from '../../../types/props';
import { formatAmount } from '../../../utils';
import TransactionItem from './TransactionItem';
import CancelledItem from './CancelledItem';
import FilledItem from './FilledItem';

const LABEL_LOOKUP = {
  FILL: 'Fill',
  CANCEL: 'Cancel',
  SEND_ETHER: 'Send',
  SEND_TOKENS: 'Send',
  WRAP_ETHER: 'Wrap',
  UNWRAP_ETHER: 'Unwrap'
};

class TransactionsList extends Component {
  render() {
    // this.props.active.push({
    //   id: '0x74dba1e2fa8ae73265520f3370c28c386a8fd89ce9c45e48a5e74c757cb70e08',
    //   type: 'SEND_ETHER',
    //   from: '0x55287087b765715477b3d8da6ffbe8f069403a16',
    //   to: '0x9bca8678b0239b604a26A57CBE76DC0D16d61e1F',
    //   amount: new BigNumber(10)
    // });

    const activeItems = this.props.active.map((tx, index) => {
      const txtype = tx.status || tx.type;
      switch (txtype) {
        case 'FILLED':
          return (
            <TouchableOpacity key={`active-${index}`}>
              <FilledItem transaction={tx} />
            </TouchableOpacity>
          );

        case 'CANCELLED':
          return (
            <TouchableOpacity key={`active-${index}`}>
              <CancelledItem transaction={tx} />
            </TouchableOpacity>
          );

        case 'SEND_ETHER':
          return (
            <TouchableOpacity key={`active-${index}`}>
              <TransactionItem
                action={txtype}
                label={LABEL_LOOKUP[txtype]}
                source={{
                  address: tx.address,
                  amount: formatAmount(tx.amount),
                  symbol: 'ETH'
                }}
                destination={{
                  address: tx.to,
                  amount: formatAmount(tx.amount),
                  symbol: 'ETH'
                }}
              />
            </TouchableOpacity>
          );

        case 'SEND_TOKENS':
          return (
            <TouchableOpacity key={`active-${index}`}>
              <TransactionItem
                action={txtype}
                label={LABEL_LOOKUP[txtype]}
                source={{
                  address: tx.address,
                  amount: formatAmount(tx.amount),
                  symbol: tx.token.symbol
                }}
                destination={{
                  address: tx.to,
                  amount: formatAmount(tx.amount),
                  symbol: tx.token.symbol
                }}
              />
            </TouchableOpacity>
          );

        default:
          return (
            <TouchableOpacity key={`active-${index}`}>
              <TransactionItem
                action={txtype}
                label={LABEL_LOOKUP[txtype]}
                address={tx.address}
                amount={formatAmount(tx.amount)}
              />
            </TouchableOpacity>
          );
      }
    });

    const items = this.props.transactions.map((tx, index) => {
      const txtype = tx.status || tx.type;
      switch (txtype) {
        case 'FILLED':
          return (
            <TouchableOpacity
              key={`tx-${index}`}
              onPress={() => this.props.dispatch(gotoEtherScan(tx.id))}
            >
              <FilledItem transaction={tx} />
            </TouchableOpacity>
          );

        case 'CANCELLED':
          return (
            <TouchableOpacity
              key={`tx-${index}`}
              onPress={() => this.props.dispatch(gotoEtherScan(tx.id))}
            >
              <CancelledItem transaction={tx} />
            </TouchableOpacity>
          );
        case 'SEND_ETHER':
          return (
            <TouchableOpacity
              key={`tx-${index}`}
              onPress={() => this.props.dispatch(gotoEtherScan(tx.id))}
            >
              <TransactionItem
                action={txtype}
                label={LABEL_LOOKUP[txtype]}
                source={{
                  address: tx.address,
                  amount: formatAmount(tx.amount),
                  symbol: 'ETH'
                }}
                destination={{
                  address: tx.to,
                  amount: tx.amount,
                  symbol: 'ETH'
                }}
              />
            </TouchableOpacity>
          );

        case 'SEND_TOKENS':
          return (
            <TouchableOpacity
              key={`tx-${index}`}
              onPress={() => this.props.dispatch(gotoEtherScan(tx.id))}
            >
              <TransactionItem
                action={txtype}
                label={LABEL_LOOKUP[txtype]}
                source={{
                  address: tx.address,
                  amount: formatAmount(tx.amount),
                  symbol: tx.token.symbol
                }}
                destination={{
                  address: tx.to,
                  amount: formatAmount(tx.amount),
                  symbol: tx.token.symbol
                }}
              />
            </TouchableOpacity>
          );

        default:
          return (
            <TouchableOpacity
              key={`tx-${index}`}
              onPress={() => this.props.dispatch(gotoEtherScan(tx.id))}
            >
              <TransactionItem
                action={txtype}
                label={LABEL_LOOKUP[txtype]}
                address={tx.address}
                amount={formatAmount(tx.amount)}
              />
            </TouchableOpacity>
          );
      }
    });

    return (
      <View>
        {activeItems}
        {items}
      </View>
    );
  }
}

TransactionsList.propTypes = {
  active: PropTypes.arrayOf(transactionProp),
  transactions: PropTypes.arrayOf(transactionProp)
};

export default connect(
  state => ({ ...state.device.layout, ...state.settings }),
  dispatch => ({ dispatch })
)(TransactionsList);
