// function deployFunc(hre) {
//   console.log("Hi!");
//   hre.getNamedAccounts;
//   hre.deployments;
// }

// module.exports.default = deployFunc;

// module.exports async (hre) => {
//   const {getNamedAccounts, deployments} = hre;

const { network, ethers } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
require("dotenv").config();
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  // const accounts = await ethers.getSigners();
  // const accountZeroo = accounts[1].address;
  // console.log(accountZeroo);
  const chainId = network.config.chainId;
  let ethUsdPriceAddress;

  // if chainId is X use address Y
  // if chainId is Z use address A

  if (chainId == 31337) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceAddress = ethUsdAggregator.address;
    log(`This is the localchain with address: ${ethUsdPriceAddress}`);
  } else {
    ethUsdPriceAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    log(`Testnet chain: ${ethUsdPriceAddress}`);
  }
  // log(ethUsdPriceAddress);

  log("Deploying contract..................");
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceAddress],
    log: true,
  });
  log(`Contract deployed at: ${fundMe.address}`);

  if (!(chainId == 31337) && process.env.ETHERSCAN_API_KEY) {
    //verify
    await verify(fundMe.address, [ethUsdPriceAddress]);
    log("Verified...........");
  }
};

module.exports.tags = ["all", "fund"];
