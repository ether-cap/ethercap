# Capture & Replay Test

## Getting Started
1. Install the dependencies: ```npm install```;
2. Copy the proxy and the upgraded version of the logic contract in the ```contracts/``` directory;
3. Copy the ABI of the logic contract in ```ABI/delegateABI.json```;
4. Copy the transactions to be replayed in ```transactions/transactions.json```
5. Set-up the ```config.js``` file: 
 * ```Delegator``` is the name of the Proxy contract deployed on the main network;
 * ```Delegate``` is the name of the current logic contract used by the Proxy on the main network;
 * ```DelegatorAddr``` is the address of the Proxy deployed on the main network;
 * ```DelegateAddr``` is the address of the current logic contract used by the Proxy on the main network;
 * ```DelegatorAdminAddr``` is the owner/administrator of the Delegator;
 * ```DelegateDeployerAddr``` is the deployer of the upgraded logic contract;
 * ```HolderAddr``` (optional) is the address of a random holder of funds;
 * ```implementationFunc``` function to retrieve the current implementation used by the Proxy;
 * ```upgradeFunc``` function to upgrade the current implementation used by the Proxy; 
 * ```buildDir``` is the path to the compiled contract directory;
 * ```logDir``` is the path to the log directory;
 * ```transactions``` is the path to the transactions to be replayed;
 * ```delegateAbi``` is the path to the abi of the logic contract.


6. Configure the test file ```test/test_mainnet.js```:
  * The ```txSetImplementation``` transaction upgrades the implementation contract used by the Proxy. Make sure to add additional parameters if needed.
  * If the  ```DelegatorAdmin``` or the ```DelegateDeployer``` require funds to perform the upgrade/deployment operations, you can decomment the  ```txTransferFunds``` transactions and configure them as needed.


## Commands
Run: 
* ```npm start replay <txHash>``` to replay a single transaction from the ```transactions.json```;
* ```npm start replayAll``` to replay all the transactions in ```transactions.json```;
