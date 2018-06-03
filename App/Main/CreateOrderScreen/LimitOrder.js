import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import BigNumber from 'bignumber.js';
import { setError } from '../../../actions';
import { getProfitLossStyle } from '../../../styles';
import { createSignSubmitOrder } from '../../../thunks';
import { formatAmount } from '../../../utils';
import Button from '../../components/Button';
import ListItemDetail from '../../components/ListItemDetail';
import TokenInput from '../../components/TokenInput';
import LogoTicker from '../../views/LogoTicker';

class CreateLimitOrder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      amount: new BigNumber(0),
      amountError: false,
      price: new BigNumber(0),
      priceError: false
    };
  }

  render() {
    const {
      navigation: {
        state: {
          params: {
            product: { quote, base },
            side
          }
        }
      }
    } = this.props;

    let buttonLabel = null;
    let subTotal = new BigNumber(this.state.amount).mul(this.state.price);
    let fee = new BigNumber(0).negated();
    let total = subTotal.add(fee);

    if (side === 'buy') {
      subTotal = subTotal.negated();
      total = total.negated();
    }

    console.warn(subTotal.toNumber(), getProfitLossStyle(subTotal.toNumber()));

    switch (side) {
      case 'buy':
        buttonLabel = `Bid ${base.symbol}`;
        break;

      case 'sell':
        buttonLabel = `Ask ${base.symbol}`;
        break;

      default:
        this.props.dispatch(
          setError(
            new Error(`Order side ${side} is not supported by Mobidex yet!`)
          )
        );
        return null;
    }

    return (
      <View>
        <LogoTicker token={base} />
        <TokenInput
          label={side === 'buy' ? 'Buying' : 'Selling'}
          token={base}
          containerStyle={{ marginTop: 10, marginBottom: 10, padding: 0 }}
          onChange={this.onSetValue('amount', 'amountError')}
          amount={this.state.amount}
        />
        <TokenInput
          label={'Price'}
          token={quote}
          containerStyle={{ marginTop: 10, marginBottom: 10, padding: 0 }}
          onChange={this.onSetValue('price', 'priceError')}
          amount={this.state.price}
        />
        <ListItemDetail
          left="Sub-Total"
          right={formatAmount(subTotal.toNumber())}
          rightStyle={getProfitLossStyle(subTotal.toNumber())}
        />
        <ListItemDetail
          left="Fee"
          right={formatAmount(fee.toNumber())}
          rightStyle={getProfitLossStyle(fee.toNumber())}
        />
        <ListItemDetail
          left="Total"
          right={formatAmount(total.toNumber())}
          rightStyle={getProfitLossStyle(total.toNumber())}
        />
        <Button
          large
          onPress={() => this.submit()}
          icon={<Icon name="check" size={24} color="white" />}
          title={buttonLabel}
        />
      </View>
    );
  }

  onSetValue(column, errorColumn) {
    return value => {
      try {
        let amount = new BigNumber(value.replace(/,/g, ''));
        if (amount.gt(0)) {
          this.setState({ [column]: amount, [errorColumn]: false });
        } else {
          this.setState({ [column]: new BigNumber(0), [errorColumn]: true });
        }
      } catch (err) {
        this.setState({ [column]: new BigNumber(0), [errorColumn]: true });
      }
    };
  }

  async submit() {
    const {
      navigation: {
        state: {
          params: {
            product: { quote, base },
            side
          }
        }
      }
    } = this.props;
    const { amount, price } = this.state;
    const result = await this.props.dispatch(
      createSignSubmitOrder(
        new BigNumber(price),
        new BigNumber(amount),
        base,
        quote,
        side
      )
    );

    if (result) {
      this.props.navigation.push('List');
    }
  }
}

CreateLimitOrder.propTypes = {
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        type: PropTypes.string.isRequired,
        side: PropTypes.string.isRequired,
        product: PropTypes.shape({
          base: PropTypes.object.isRequired,
          quote: PropTypes.object.isRequired
        }).isRequired
      }).isRequired
    }).isRequired
  }).isRequired
};

export default connect(
  (state, ownProps) => ({
    ...state.device,
    ...state.relayer,
    ...state.settings,
    ...state.wallet,
    ...ownProps
  }),
  dispatch => ({ dispatch })
)(CreateLimitOrder);
