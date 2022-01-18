const Web3 = require("web3");
const fs = require("fs");

// ENTER A VALID RPC URL!
const web3 = new Web3("https://rpc.ftm.tools/");

const VAULT_CONTRACT = require("./vault_contract.json");

const vaultContract = new web3.eth.Contract(
  VAULT_CONTRACT.abi,
  VAULT_CONTRACT.address
);

async function getVaultCollateralBalance(vaultNumber) {
  const collateral = await vaultContract.methods
    .vaultCollateral(vaultNumber)
    .call();
  const collateralParsed = collateral / 1.0e18;
  return collateralParsed;
}

async function getVaultDebtBalance(vaultNumber) {
  const debt = await vaultContract.methods.vaultDebt(vaultNumber).call();
  const debtParsed = debt / 1.0e18;
  return debtParsed;
}

async function getVaultOwner(vaultNumber) {
  const owner = await vaultContract.methods.ownerOf(vaultNumber).call();
  return owner;
}

async function getVaultCount() {
  const vaultCount = await vaultContract.methods.vaultCount().call();
  return parseInt(vaultCount);
}

async function getVaultData(vaultNumber) {
  const owner = await getVaultOwner(vaultNumber);
  const vaultDebt = await getVaultDebtBalance(vaultNumber);
  const vaultCollateral = await getVaultCollateralBalance(vaultNumber);
  const vaultData = {
    id: vaultNumber,
    owner,
    vaultDebt,
    vaultCollateral,
  };
  return vaultData;
}

function dataToCSV(data) {
  return data.reduce((csv, current) => {
    return (
      csv +
      current.id +
      ", " +
      current.owner +
      ", " +
      current.vaultDebt +
      ", " +
      current.vaultCollateral +
      "\n"
    );
  }, "id, owner, vaultDebt, vaultCollateral \n");
}

async function saveCSV(dataCSV) {
  try {
    fs.writeFileSync("maiVaultData.csv", dataCSV);
    //file written successfully
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  const vaultCount = await getVaultCount();
  const data = [];
  for (var i = 0; i <= vaultCount; i++) {
    try {
      const vaultData = await getVaultData(i);
      data.push(vaultData);
    } catch (err) {}
  }
  const csv = dataToCSV(data);
  saveCSV(csv);
}

main();
