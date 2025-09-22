const { ethers } = require("ethers");
require("dotenv").config();

const contractAddress = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const abi = require("./artifacts/contracts/TaskManager.sol/TaskManager.json").abi;

//Connect to Sepolia via Infura or local node
const provider = new ethers.providers.JsonRpcProvider(
  process.env.NODE_ENV === 'production' 
    ? process.env.INFURA_URL 
    : "http://127.0.0.1:8545"
);

//Use private key to create signer wallet
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

//Contract instance with signer
const tasksContract = new ethers.Contract(contractAddress, abi, signer);

//Create task on-chain
// In your ethers.js or backend code
async function createTaskOnChain(content) {
  try {
    const address = await signer.getAddress();
    const dueDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now

    const txResponse = await tasksContract.createTask(content, address, dueDate, { gasLimit: 300000 });
    const txReceipt = await txResponse.wait();
    const block = await provider.getBlock(txReceipt.blockNumber);
    
    // Return all relevant details
    return {
      success: true,
      txHash: txReceipt.transactionHash,
      blockNumber: txReceipt.blockNumber,
      blockTimestamp: new Date(block.timestamp * 1000).toISOString(),
      title: content,
      status: "On-chain"
    };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
// Update task on-chain
async function updateTaskOnChain(taskId, newContent) {
  try {
    const txResponse = await tasksContract.updateTask(taskId, newContent, { gasLimit: 200000 });
    const txReceipt = await txResponse.wait();
    const block = await provider.getBlock(txReceipt.blockNumber);

    return {
      success: true,
      txHash: txReceipt.transactionHash,
      blockNumber: txReceipt.blockNumber,
      blockTimestamp: new Date(block.timestamp * 1000).toISOString(),
      updatedContent: newContent,
      taskId: taskId,
      status: "Updated on-chain"
    };
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

//Check Sepolia Wallet Balance (optional helper)

async function checkBalance() {
  try {
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    console.log("✅ Wallet address:", address);
    console.log("💰 Sepolia Balance (ETH):", ethers.utils.formatEther(balance));
  } catch (error) {
    console.error("❌ Error checking balance:", error);
  }
}

//Show latest block
async function showBlock() {
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log("📦 Latest Sepolia block:", blockNumber);
  } catch (error) {
    console.error("❌ Error fetching block number:", error);
  }
}


//Run the helpers (optional)
checkBalance();
showBlock();
//Export the create function
module.exports = {
  createTaskOnChain
};
