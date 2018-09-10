import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { BigNumber } from '0x.js';
import ethUtil from 'ethereumjs-util';
import { ContractDefinitionLoader } from 'web3-contracts-loader';
import { cache, time } from '../decorators/cls';
import { hex2a } from '../utils';
import ZeroExClient from './0x.js';

const TokenABI = require('../abi/Token.json');
const BytesTokenABI = require('../abi/BytesToken.json');

export default class TokenClient {
  constructor(ethereumClient, address) {
    this.ethereumClient = ethereumClient;
    this.address = address;
  }

  @time
  @cache(function() {
    return 'client:token:' + this.address;
  }, 24 * 60 * 60)
  async get() {
    let networkId = await this.ethereumClient.getNetworkId();
    let contract = ContractDefinitionLoader({
      web3: this.ethereumClient.getWeb3(),
      contractDefinitions: {
        Token: {
          ...TokenABI,
          networks: {
            [networkId]: {
              address: this.address
            }
          }
        }
      },
      options: null
    }).Token;
    let bytesContract = ContractDefinitionLoader({
      web3: this.ethereumClient.getWeb3(),
      contractDefinitions: {
        Token: {
          ...BytesTokenABI,
          networks: {
            [networkId]: {
              address: this.address
            }
          }
        }
      },
      options: null
    }).Token;

    let name = null;
    let symbol = null;
    let decimals = null;

    try {
      name = await new Promise((resolve, reject) => {
        contract.name.call((err, data) => {
          if (err) {
            bytesContract.name.call((err, data) => {
              if (err) return reject(err);
              else
                return resolve(
                  hex2a(data)
                    .trim()
                    .substring(1)
                );
            });
          } else return resolve(data);
        });
      });
    } catch (err) {
      console.warn('MOBIDEX: ', 'Could not fetch name', err);
      return null;
    }

    try {
      symbol = await new Promise((resolve, reject) => {
        contract.symbol.call((err, data) => {
          if (err) {
            bytesContract.symbol.call((err, data) => {
              if (err) return reject(err);
              else
                return resolve(
                  hex2a(data)
                    .trim()
                    .substring(1)
                );
            });
          } else return resolve(data);
        });
      });
    } catch (err) {
      console.warn('MOBIDEX: ', 'Could not fetch symbol', err);
      return null;
    }

    try {
      decimals = await new Promise((resolve, reject) => {
        contract.decimals.call((err, data) => {
          if (err) return reject(err);
          else return resolve(parseInt(data));
        });
      });
    } catch (err) {
      console.warn('MOBIDEX: ', 'Could not fetch decimals', err);
      return null;
    }

    let token = { address: this.address, name, symbol, decimals };

    if (!token.name || !token.symbol || !token.decimals) {
      return null;
    }

    return token;
  }

  @time
  @cache(function() {
    return 'client:token:' + this.address + ':balance';
  }, 60)
  async getBalance() {
    const contractWrappers = await new ZeroExClient(
      this.ethereumClient
    ).getContractWrappers();
    const account = await this.ethereumClient.getAccount();
    const balance = await contractWrappers.erc20Token.getBalanceAsync(
      `0x${ethUtil.stripHexPrefix(this.address.toString().toLowerCase())}`,
      `0x${ethUtil.stripHexPrefix(account.toString().toLowerCase())}`
    );
    return balance;
  }

  @time
  @cache(function() {
    return 'client:token:' + this.address + ':allowance';
  }, 60)
  async getAllowance() {
    const contractWrappers = await new ZeroExClient(
      this.ethereumClient
    ).getContractWrappers();
    const account = await this.ethereumClient.getAccount();
    return await contractWrappers.erc20Token.getProxyAllowanceAsync(
      `0x${ethUtil.stripHexPrefix(this.address.toString())}`,
      `0x${ethUtil.stripHexPrefix(account.toString().toLowerCase())}`
    );
  }

  @time
  async setUnlimitedProxyAllowance() {
    const contractWrappers = await new ZeroExClient(
      this.ethereumClient
    ).getContractWrappers();
    const account = await this.ethereumClient.getAccount();
    return await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
      `0x${ethUtil.stripHexPrefix(this.address.toString().toLowerCase())}`,
      `0x${ethUtil.stripHexPrefix(account.toString().toLowerCase())}`
    );
  }

  @time
  async send(to, amount) {
    const contractWrappers = await new ZeroExClient(
      this.ethereumClient
    ).getContractWrappers();
    const account = await this.ethereumClient.getAccount();
    const { decimals } = await this.get();
    const value = Web3Wrapper.toBaseUnitAmount(new BigNumber(amount), decimals);
    return await contractWrappers.erc20Token.transferAsync(
      `0x${ethUtil.stripHexPrefix(this.address.toString().toLowerCase())}`,
      `0x${ethUtil.stripHexPrefix(account.toString().toLowerCase())}`,
      `0x${ethUtil.stripHexPrefix(to)}`.toLowerCase(),
      value
    );
  }
}
