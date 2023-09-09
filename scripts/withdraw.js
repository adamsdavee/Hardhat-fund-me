const { deployments, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  console.log(deployer);
  await deployments.fixture(["all"]);
  const fundingMe = await deployments.get("FundMe", deployer);
  const fundMe = await ethers.getContractAt("FundMe", fundingMe.address);
  //   console.log(fundMe);

  console.log("withdrawing from contract....");
  const transactionResponse = await fundMe.withdrawal();
  console.log("Okay...?");
  await transactionResponse.wait(1);
  console.log("withdrawn");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
