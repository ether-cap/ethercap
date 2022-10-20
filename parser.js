const fs = require('fs')
const config = require('./config')
const chalk = require('chalk')

let txPath = config.transactions;

/**
 * Get all (filtered) transactions
 * @returns 
 */
function getAllTransactions() {
  let rawTx = fs.readFileSync(txPath);
  let jsonTx = JSON.parse(rawTx);
  let filteredTx = [];
  jsonTx.forEach(tx => {
    if (tx.isError === '0') {
      filteredTx.push(tx);
    }
  });
  return filteredTx;
}

/**
 * Get a transaction by hash
 * @returns 
 */
function getTransaction(_txHash) {
  let rawTx = fs.readFileSync(txPath);
  let jsonTx = JSON.parse(rawTx);
  const tx = jsonTx.filter(transaction => transaction.hash === _txHash)[0];
  if (!tx || tx.isError === '1') {
    console.error(chalk.red("> Hash \"" + _txHash + "\" does not correspond to a valid transaction."));
    process.exit(1);
  }
  return tx;
}

/**
 * Get the addresses to be unlocked to replay a transaction
 * @param _tx the transaction
 * @returns an array of addresses to be unlocked
 */
function getAddressesToUnlock(_tx) {
  let addressList = [];
  addressList.push(_tx.from, config.DelegatorAdmin, config.DelegateDeployer);
  if (config.Holder != "") {
    addressList.push(config.Holder);
  }
  return addressList;
}

/**
 * Get the addresses to be unlocked to replay all the transactions
 * @param _txHash the transaction hash
 * @returns an array of addresses to be unlocked
 */
function getAllAddressesToUnlock(transactions) {
  let addressList = [];

  addressList.push(config.DelegatorAdmin, config.DelegateDeployer);
  if (config.Holder != "") {
    addressList.push(config.Holder);
  }

  //Add addresses of transaction senders
  transactions.forEach(tx => {
    if (!addressList.includes(tx.from)) {
      addressList.push(tx.from);
    }
  });
  return addressList;
}


module.exports = {
  getAllTransactions: getAllTransactions,
  getTransaction: getTransaction,
  getAddressesToUnlock: getAddressesToUnlock,
  getAllAddressesToUnlock: getAllAddressesToUnlock
};