const fs = require('fs')
const config = require('./config')
const parser = require("./parser");
const InputDataDecoder = require('ethereum-input-data-decoder');

/**
 * Setup report
 */
function setup() {
  fs.writeFileSync(config.logDir + "/report.txt","", function (err) {
    if (err) return console.log(err);
  })
  fs.writeFileSync(config.logDir + "/log.csv", "Hash$Method$Success$ResultL1$ErrorL1$ResultL2$ErrorL2$TestTime$ReplayTime \n", function (err) {
    if (err) return console.log(err);
  })
}

/**
 * Extracts the test results from a report in the /mochawesome-report directory and logs it to a csv file
 */
function logToCsv(txHash, replayTime) {

  const tx = parser.getTransaction(txHash);

  //Rename report file
  const reportPath = config.logDir + '/mochawesome-report/mochawesome-' + txHash + '.json';

  if (fs.existsSync(reportPath)) {
    //Extract current test info from the mochawesome report of the mutant
    let rawdata = fs.readFileSync(reportPath);
    let json = JSON.parse(rawdata);

    let testTime = json.stats.duration;
    let success = true;
    if (json.stats.failures > 0) {
      success = false;
    }

    let resultL1 = "None";
    let errorL1 = "None";
    let resultL2 = "None";
    let errorL2 = "None";

    let testMethods = json.results[0].suites[0].suites[0].tests;
    testMethods.forEach(m => {
      if (m.title === 'should successfully replay the transaction on L1') {
        resultL1 = m.state;
        if (m.err) {
          errorL1 = m.err.message;
        }
      } else if (m.title === 'should successfully replay the transaction on L2') {
        if (m.state)
          resultL2 = m.state;
        if (m.err.message)
          errorL2 = m.err.message;
      }
    });

    const row = txHash + '$' + tx.functionName + '$' + success + '$' + resultL1 + '$' + errorL1 + '$' + resultL2 + '$' +
      errorL2 + '$' + testTime + '$' + replayTime +'\n';

    fs.appendFileSync(config.logDir + "/log.csv", row, function (err) {
      if (err) return console.log(err);
    })
  } else {
    console.log('ERROR: Could not access ' + config.logDir + '/mochawesome-report/mochawesome-' + txHash + '.json');
  }
}

/**
 * Logs a message to a report
 */
 function log(message) {
  //Rename report file
  let reportPath = config.logDir + '/report.txt';

  if (fs.existsSync(reportPath)) {
    
    fs.appendFileSync(config.logDir + "/report.txt", message, function (err) {
      if (err) return console.log(err);
    })
  } else {
    console.log('ERROR: Could not access ' + config.logDir + '/report.txt');
  }
}


module.exports = {
  setup: setup,
  log: log,
  logToCsv: logToCsv
};