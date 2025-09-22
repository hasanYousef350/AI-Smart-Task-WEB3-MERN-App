const hre = require("hardhat");

async function main() {
  const Tasks = await hre.ethers.getContractFactory("TaskManager");
  const tasks = await Tasks.deploy(); // Deploys the contract

  await tasks.deployed(); // Ethers v5: Waits for deployment

  console.log("Tasks contract deployed to:", tasks.address); // Ethers v5: .address property
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
