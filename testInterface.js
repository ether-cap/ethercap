const { spawnSync, spawn } = require("child_process");
const os = require("os");
const fs = require("fs");

/**
* Spawns a new test process with Truffle on the forked network
*/
function spawnTest(tx) {
    var testChild;
    if (process.platform === "win32") {
        testChild = spawnSync("npm.cmd", ["--transaction="+JSON.stringify(tx), "run-script", "test"], { stdio: "inherit" });
    } else if (process.platform === "linux" || process.platform === "darwin") {
        testChild = spawnSync("npm",  ["--transaction="+JSON.stringify(tx), "run-script", "test"], { stdio: "inherit" });
    }
    return testChild.status;
}

/**
 * Spawns a new Ganache instance
 * @param block the block from which the main network must be forked
 * @param addressList the list of addresses to be unlocked
 */
function spawnGanache(block, addressList) {
    var child;
    if (process.platform === "win32") {
        child = spawn("ganache.cmd", ["--fork", "--fork.blockNumber", block, "--u", ...addressList], { stdio: "inherit", detached: true });
    } else if (process.platform === "linux" || process.platform === "darwin") {
        child = spawn("ganache", ["--fork", "--fork.blockNumber", block, "--u", ...addressList], { stdio: "inherit", detached: true });
    }
    child.unref;
    return child;
}

/**
 * Kills a spawned Ganache instance
 */
function killGanache(ganacheChild) {
    if (process.platform === "win32") {
        spawn("taskkill", ["/pid", ganacheChild.pid, "/f", "/t"]);
    } else if (process.platform === "linux" || process.platform === "darwin") {
        ganacheChild.kill("SIGHUP");
    }
}

/**
 * Cleans the temporary files generated by Ganache
 */
 function cleanTmp() {
    var dir = os.tmpdir();
    fs.readdirSync(dir).forEach(f => {
      if (f.substring(0, 4) === 'tmp-') {
        rimraf.sync(`${dir}/${f}`)
      }
    });
  }

module.exports = {
    spawnTest: spawnTest,
    spawnGanache: spawnGanache,
    killGanache: killGanache,
    cleanTmp:cleanTmp
};
