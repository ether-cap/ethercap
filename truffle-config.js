
module.exports = {
  networks: {
    mainnet_fork: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      networkCheckTimeout: 999999 //connection timeout
    }
  },
  compilers: {
    solc: {
      version: "pragma",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        },
        //  evmVersion: "byzantium"
      }
    }
  },
  mocha: {
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "./log/mochawesome-report",
      html: false
    }
  },
}
