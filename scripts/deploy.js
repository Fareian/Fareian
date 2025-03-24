const hre = require("hardhat");

async function main() {
  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();
  await simpleStorage.deploymentTransaction().wait();
  console.log(`SimpleStorage deployed to: ${simpleStorage.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 