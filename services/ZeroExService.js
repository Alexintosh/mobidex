import { BigNumber } from '0x.js';
import ethUtil from 'ethereumjs-util';
import { ContractDefinitionLoader } from 'web3-contracts-loader';
import ZeroExClient from '../clients/0x';
import EthereumClient from '../clients/ethereum';
import TokenClient from '../clients/token';
import { TransactionService } from './TransactionService';

const TOKEN_ABI = require('../abi/Token.json');
const WETH_ABI = require('../abi/WETH9.json');
const EXCHANGE_ABI = require('../abi/Exchange_v1.json');

let _store;

/**
 * Keeping contracts around for estimate gas
 */

async function getTokenContract(address) {
  const {
    wallet: { web3 }
  } = _store.getState();
  const ethereumClient = new EthereumClient(web3);
  const networkId = await ethereumClient.getNetworkId();
  return ContractDefinitionLoader({
    web3,
    contractDefinitions: {
      Token: {
        ...TOKEN_ABI,
        networks: {
          [networkId]: {
            address
          }
        }
      }
    },
    options: null
  }).Token;
}

async function getWETHContract(address) {
  const {
    wallet: { web3 }
  } = _store.getState();
  const ethereumClient = new EthereumClient(web3);
  const networkId = await ethereumClient.getNetworkId();
  return ContractDefinitionLoader({
    web3,
    contractDefinitions: {
      WETH: {
        ...WETH_ABI,
        networks: {
          [networkId]: {
            address
          }
        }
      }
    },
    options: null
  }).WETH;
}

async function getExchangeV1Contract(address) {
  const {
    wallet: { web3 }
  } = _store.getState();
  const ethereumClient = new EthereumClient(web3);
  const networkId = await ethereumClient.getNetworkId();
  return ContractDefinitionLoader({
    web3,
    contractDefinitions: {
      Exchange_v1: {
        ...EXCHANGE_ABI,
        networks: {
          [networkId]: {
            address
          }
        }
      }
    },
    options: null
  }).Exchange_v1;
}

export function setStore(store) {
  _store = store;
}

export async function setUnlimitedProxyAllowance(address) {
  const {
    wallet: { web3 }
  } = _store.getState();
  const ethereumClient = new EthereumClient(web3);
  const tokenClient = new TokenClient(ethereumClient, address);
  const txhash = await tokenClient.setUnlimitedProxyAllowance();
  const activeTransaction = {
    id: txhash,
    type: 'APPROVAL',
    address,
    amount: 'UNLIMITED'
  };
  await TransactionService.instance.addActiveTransaction(activeTransaction);
}

export async function deposit(address, amount) {
  const {
    wallet: { web3 }
  } = _store.getState();
  const ethereumClient = new EthereumClient(web3);
  const zeroExClient = new ZeroExClient(ethereumClient);
  const txhash = await zeroExClient.depositEther(new BigNumber(amount));
  const activeTransaction = {
    id: txhash,
    type: 'DEPOSIT',
    address,
    amount
  };
  await TransactionService.instance.addActiveTransaction(activeTransaction);
}

export async function withdraw(address, amount) {
  const {
    wallet: { web3 }
  } = _store.getState();
  const ethereumClient = new EthereumClient(web3);
  const zeroExClient = new ZeroExClient(ethereumClient);
  const txhash = await zeroExClient.withdrawEther(new BigNumber(amount));
  const activeTransaction = {
    id: txhash,
    type: 'WITHDRAWAL',
    address,
    amount
  };
  await TransactionService.instance.addActiveTransaction(activeTransaction);
}

export async function fillOrder(order, fillBaseUnitAmount, amount) {
  const {
    wallet: { web3 }
  } = _store.getState();
  const ethereumClient = new EthereumClient(web3);
  const zeroExClient = new ZeroExClient(ethereumClient);
  const zeroEx = await zeroExClient.getZeroExClient();
  const account = await ethereumClient.getAccount();
  const txhash = await zeroEx.exchange.fillOrderAsync(
    order,
    fillBaseUnitAmount,
    true,
    `0x${ethUtil.stripHexPrefix(account.toString().toLowerCase())}`,
    { shouldValidate: true }
  );
  const activeTransaction = {
    ...order,
    id: txhash,
    type: 'FILL',
    amount
  };
  await TransactionService.instance.addActiveTransaction(activeTransaction);
}

export async function batchFillOrKill(orderRequests, amount) {
  const {
    wallet: { web3 }
  } = _store.getState();
  const ethereumClient = new EthereumClient(web3);
  const zeroExClient = new ZeroExClient(ethereumClient);
  const zeroEx = await zeroExClient.getZeroExClient();
  const account = await ethereumClient.getAccount();
  const txhash = await zeroEx.exchange.batchFillOrKillAsync(
    orderRequests,
    `0x${ethUtil.stripHexPrefix(account.toString().toLowerCase())}`,
    { shouldValidate: true }
  );
  const activeTransaction = {
    id: txhash,
    type: 'BATCH_FILL',
    amount: amount
  };
  await TransactionService.instance.addActiveTransaction(activeTransaction);
}
