async function main() {
  const FlipCoin = await ethers.getContractFactory("FlipCoin");
  const flipCoin = await FlipCoin.deploy();
  await flipCoin.deployed();
  console.log("FlipCoin deployed to:", flipCoin.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
