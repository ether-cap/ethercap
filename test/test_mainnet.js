const fs = require('fs')
const chalk = require('chalk')
const InputDataDecoder = require('ethereum-input-data-decoder');
const config = require('../config')
const logger = require('../logger');
const assert = require("assert");
const Delegator = artifacts.require(config.Delegator);
const Delegate = artifacts.require(config.Delegate);

contract("Delegator", () => {

  describe('REPLAY', () => {
    let tx = JSON.parse(process.env.npm_config_transaction);
    let decoder;
    let oracle;

    fs.readFile(config.delegateAbi, 'utf8', function (err, data) {
      if (err) {
        console.log(err)
      } else {
        let compiled = JSON.parse(data);
        decoder = new InputDataDecoder(compiled);
      }
    });

    it(`should successfully replay the transaction on L1`, async () => {

      logger.log('> [TEST]: it should successfully replay the transaction on the original logic contract\n')

     
      //Process the transaction
      let replaySender = tx.from;
      let replayValue = tx.value;
      let decodedInput = decoder.decodeData(tx.input)
      let replayValues = [];

      for (let j = 0; j < decodedInput.types.length; j++) {
        replayValues.push(decodedInput.inputs[j]);
      }

      let proxy = await Delegator.at(config.DelegatorAddr);

      //Check the current Proxy implementation
      console.log(chalk.yellow("\n> Checking current Logic contract used by the Proxy"));
      logger.log('- Checking current Logic contract used by the Proxy\n')

      const txCheckLogicV1 = await proxy[config.implementationFunc].call({ from: config.DelegatorAdminAddr });

      assert.equal(txCheckLogicV1.toString(), config.DelegateAddr);
      console.log("✔️ Proxy is using LogicV1 @ " + txCheckLogicV1.toString() + '\n');
      logger.log("- Proxy is using LogicV1 @ " + txCheckLogicV1.toString() + '\n')

      proxy =  await Delegate.at(config.DelegatorAddr);

      //Replay the original transaction (Logic V1)
      console.log(chalk.yellow("\n> Replaying transaction on LogicV1"));
      logger.log("- Replaying transaction on LogicV1\n");
      const originalCall = await proxy[decodedInput.method].call(...replayValues, { from: replaySender, value: replayValue });
      oracle = originalCall.toString();
      console.log("-- Original output: " + oracle + "\n");   
      logger.log("-- Original output: " + oracle + "\n\n");          
    });


    it(`should successfully replay the transaction on L2`, async () => {
      logger.log('> [TEST]: it should successfully replay the transaction on the upgraded logic contract\n')

      //Process the transaction
      let replaySender = tx.from;
      let replayValue = tx.value;
      let decodedInput = decoder.decodeData(tx.input)
      let replayValues = [];

      for (let j = 0; j < decodedInput.types.length; j++) {
        replayValues.push(decodedInput.inputs[j]);
      }

      //Deploy the Logic contract V2
      console.log(chalk.yellow("\n> Upgrading the logic contract used by the Proxy"));
      logger.log("- Upgrading the logic contract used by the Proxy\n");

      //Transfer funds from Holder to DelegateDeployer so that it can deploy the new implementation
      //  const txTransferFunds = await web3.eth.sendTransaction({ to: config.DelegateDeployerAddr, from: config.HolderAddr, value: web3.utils.toWei('1') })
      //  console.log("✔️ Funds transferred to admin @: " + config.DelegateDeployerAddr + '\n');
      //  logger.log("- Funds transferred to admin @: " + config.DelegateDeployerAddr + '\n');

      const logicV2 = await Delegate.new({ from: config.DelegateDeployerAddr });
      console.log("✔️ LogicV2 deployed @: " + logicV2.address);
      logger.log("- LogicV2 deployed @: " + logicV2.address+'\n');

      //Transfer funds from Holder to DelegatorAdmin so that it can set the new implementation
      //  const txTransferFunds = await web3.eth.sendTransaction({ to: config.DelegatorAdminAddr, from: config.HolderAddr, value: web3.utils.toWei('1') })
      //  console.log("✔️ Funds transferred to admin @: " + config.DelegatorAdminAddr + '\n');
      //  logger.log("- Funds transferred to admin @: " + config.DelegatorAdminAddr + '\n');

      //Set the implementation of the proxy to logic contract V2
      let proxy =  await Delegator.at(config.DelegatorAddr);

      const txSetImplementation = await proxy[config.upgradeFunc](logicV2.address, { from: config.DelegatorAdminAddr });
      console.log("✔️ Proxy implementation upgraded");
      logger.log("- Proxy implementation upgraded\n");

      //Ensure that the proxy is using the newly-deployed logic contract
      const txCheckLogicV2 = await proxy.implementation.call({from: config.DelegatorAdminAddr});
      assert.equal(txCheckLogicV2.toString(), logicV2.address.toString());
      console.log("✔️ Proxy is using LogicV2 @ " + txCheckLogicV2.toString() + '\n');
      logger.log("- Proxy is using LogicV2 @ " + txCheckLogicV2.toString() + '\n');

      //Replay the call on contract V2
      proxy =  await Delegate.at(config.DelegatorAddr);
      console.log(chalk.yellow("\n> Replaying transaction on LogicV2"));
      logger.log("- Replaying transaction on LogicV2\n");
      const replayCall = await proxy[decodedInput.method].call(...replayValues, { from: replaySender, value: replayValue});

      const replayOutput = replayCall.toString();
      console.log("-- Replay output: " + replayOutput + "\n")
      logger.log("-- Replay output: " + replayOutput + "\n\n")
      assert.equal(oracle, replayOutput);
    });
  })
});
