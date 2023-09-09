const { deployments, getNamedAccounts } = require("hardhat");

async function main() {
  console.log("Hi");
  await deployments.fixture(["all"]); // Not a must, you can run hardhat deploy first
  console.log("still pushing....");
  const { deployer } = await getNamedAccounts();
  console.log(deployer);
  const fundingMe = await deployments.get("FundMe", deployer);
  console.log("alright here...");
  const fundMe = await ethers.getContractAt("FundMe", fundingMe.address);
  console.log("Funding contract.....");
  const transactionResponse = await fundMe.fund({
    value: ethers.parseEther("0.1"),
  });
  await transactionResponse.wait(1);
  console.log("Funded!");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
