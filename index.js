const fs = require('fs')
const mkdirp = require('mkdirp')
const chalk = require('chalk')

const parser = require("./parser");
const testingInterface = require('./testInterface')
const config = require('./config');
const logger = require('./logger');



async function replayAll() {
    if (!fs.existsSync(config.logDir)) {
        fs.mkdirSync(config.logDir);
    }
    logger.setup();
    logger.log("> Replay all transactions");
    console.log(chalk.bold.yellow('> Replay all transactions \n'));
    let transactions = parser.getAllTransactions();
    runTest(transactions);
}

async function replay(hash) {
    if (!fs.existsSync(config.logDir)) {
        fs.mkdirSync(config.logDir);
    }
    logger.setup();
    logger.log("> Replay transaction " + hash + '\n');
    console.log(chalk.bold.yellow('> Replay transaction ') + hash);
    let transactions = [];
    transactions.push(parser.getTransaction(hash));
    runTest(transactions);
}

function runTest(transactions) {
    for (let i = 0; i < transactions.length; i++) {
        let startReplay = Date.now();
        let tx = transactions[i];
        const prevBlock = tx.blockNumber - 1;
        const addressList = parser.getAddressesToUnlock(tx);
        logger.log("- Forking Mainnet @ block " + prevBlock + '\n');
        logger.log("- Unlocking addresses: \n");

        console.log(chalk.bold.yellow("\n> Forking Mainnet @ block " + prevBlock));
        console.log("- Unlocking addresses:");
        addressList.forEach(address => {
            console.log("- 🔓 " + address);
            logger.log("  - " + address + '\n');
        });

        console.log("\n> Waiting for Ganache ...");
        logger.log("\n> Waiting for Ganache ...\n\n");

        let ganache = testingInterface.spawnGanache(prevBlock, addressList);
        if (ganache) {
            const status = testingInterface.spawnTest(tx);
            if (status === 0) {
                console.info(chalk.green("Tx " + tx.hash + " passed."));
                logger.log("> Tx " + tx.hash + " passed.\n");
            } else {
                console.error(chalk.red("Tx " + tx.hash + " failed."));
                logger.log("> Tx " + tx.hash + " failed.\n");
            }
            renameTestReport(tx.hash);
            console.log("> Closing Ganache @pid " + ganache.pid + " ...\n")
            logger.log("> Closing Ganache @pid " + ganache.pid + " ...\n");
            testingInterface.killGanache(ganache);
            let replayTime = Date.now() - startReplay;
            logger.logToCsv(tx.hash, replayTime)
            testingInterface.cleanTmp();
        }
    }
    console.log(chalk.bold.yellow('> Done 👋'));
}

/**
 * Rename the mochawesome test report
*/
function renameTestReport(txHash) {
    //Rename report file
    let pathJson = config.logDir + '/mochawesome-report/mochawesome.json';
    //Renames the mutant report
    fs.renameSync(pathJson, config.logDir + '/mochawesome-report/mochawesome-' + txHash + '.json', function (err) {
        if (err) console.log('ERROR: ' + err);
    });
}

module.exports = {
    replayAll: replayAll,
    replay: replay
};
