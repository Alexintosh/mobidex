import React from "react";
import { StackNavigator, TabNavigator } from "react-navigation";
import EntypoIcon from "react-native-vector-icons/Entypo";
import FAIcon from "react-native-vector-icons/FontAwesome";
import BlankHeader from "./App/headers/Blank";
import NormalHeader from "./App/headers/Normal";
import TradingHeader from "./App/headers/Trading";
import TokenDetailsScreen from "./App/screens/TokenDetailsScreen";
import PortfolioScreen from "./App/screens/PortfolioScreen";
import TradingScreen from "./App/screens/TradingScreen";
import CreateOrderScreen from "./App/screens/CreateOrderScreen";
import OrderDetailsScreen from "./App/screens/OrderDetailsScreen";
import ReceiveScreen from "./App/screens/ReceiveScreen";
import SendScreen from "./App/screens/SendScreen";
import TransactionHistoryScreen from "./App/screens/TransactionHistoryScreen";
import UnwrapEtherScreen from "./App/screens/UnwrapEtherScreen";
import WrapEtherScreen from "./App/screens/WrapEtherScreen";

const TransactionsStack = StackNavigator({
  History: { screen: TransactionHistoryScreen }
}, {
  initialRouteName: "History",
  navigationOptions: ({ navigation }) => {
    return {
      header: <BlankHeader navigation={navigation} />
    };
  }
});

const TradingStack = StackNavigator({
  Trading: { screen: TradingScreen },
  CreateOrder: { screen: CreateOrderScreen },
  OrderDetails: { screen: OrderDetailsScreen }
}, {
  initialRouteName: "Trading",
  navigationOptions: ({ navigation }) => {
    switch(navigation.state.routeName) {
    case "Trading":
      return { header: <TradingHeader navigation={navigation} /> };
    default:
      return { header: <NormalHeader navigation={navigation} /> };
    }
  }
});

const WalletStack = StackNavigator({
  Portfolio: { screen: PortfolioScreen },
  TokenDetails: { screen: TokenDetailsScreen },
  Receive: { screen: ReceiveScreen },
  Send: { screen: SendScreen },
  Wrap: { screen: WrapEtherScreen },
  Unwrap: { screen: UnwrapEtherScreen },
}, {
  initialRouteName: "Portfolio",
  navigationOptions: ({ navigation }) => {
    switch(navigation.state.routeName) {
    case "Portfolio":
      return { header: <BlankHeader navigation={navigation} /> };
    default:
      return { header: <NormalHeader navigation={navigation} /> };
    }
  }
});

export default TabNavigator({
  Wallet: { screen: WalletStack },
  Trading: { screen: TradingStack },
  Transactions: { screen: TransactionsStack }
}, {
  initialRouteName: "Wallet",
  swipeEnabled: true,
  lazy: true,
  navigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused, tintColor }) => {
      const { routeName } = navigation.state;

      switch(routeName) {
      case "Wallet":
        return <EntypoIcon name="wallet" size={25} color={tintColor} />;
      case "Trading":
        return <FAIcon name="exchange" size={25} color={tintColor} />;
      case "Transactions":
        return <FAIcon name="list" size={25} color={tintColor} />;
      }
    },
  }),
  tabBarOptions: {
    activeTintColor: '#86939e',
    inactiveTintColor: '#bdc6cf',
  },
});
