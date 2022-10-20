# Capture & Replay Test

## Getting Started
1. Install the dependencies: ```npm install```;
2. Copy the proxy and the upgraded version of the logic contract in the ```contracts/``` directory;
3. Copy the ABI of the logic contract in ```ABI/delegateABI.json```;
4. Copy the transactions to be replayed in ```transactions/transactions.json```
5. Set-up the ```config.js``` file: 
-- ```Delegator``` is the address of the Proxy deployed on the main network;
-- ```Delegate``` is the address of the current logic contract used by the Proxy on the main network;
-- ```DelegatorAdmin``` is the owner/administrator of the Delegator;
-- ```DelegateDeployer``` is the deployer of the upgraded logic contract;
-- ```Holder``` (optional) is the address of a random holder of funds;
-- ```buildDir``` is the path to the compiled contract directory;
-- ```logDir``` is the path to the log directory;
-- ```transactions``` is the path to the transactions to be replayed;
-- ```delegateAbi``` is the path to the abi of the logic contract


1. Configure the test file ```test/test_mainnet.js```:
  -- Set the Delegator and Delegate artifacts;
  -- To ensure that the proxy is using the correct logic contract, we retrieve its implementation with ```proxy.implementation.call()```. Make sure to replace this with the appropriate method, or comment out the check.
  -- The ```txSetImplementation``` transaction upgrades the implementation of the Proxy. Make sure to use the correct method and parameters for the upgrade operation.
  -- If the  ```DelegatorAdmin``` requires funds to perform the logic upgrade operation, you can decomment the  ```txTransferFunds``` transaction and configure it as needed.


## Commands
Run: 
* ```npm start replay <txHash>``` to replay a single transaction from the ```transactions.json```;
* ```npm start replayAll``` to replay all the transactions in ```transactions.json```;