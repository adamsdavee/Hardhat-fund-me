const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const {
  networkConfig,
  developmentChains,
} = require("../../helper-hardhat-config");

// let variable = false
// someVar = variable ? "yes" : "no"
// also means if(variable) {someVar = yes} else{someVar = no}

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let fundingMe;
      let deployer;
      const sendValue = ethers.parseEther("1");

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        /* await deployments.fixture(["fund"]); i guess it's not a must as you can run the hardhat-deploy
        and use deployments to get the various contracts you need s this line just deploys the FUndMe contract*/
        fundingMe = await deployments.get("FundMe", deployer);
        fundMe = await ethers.getContractAt("FundMe", fundingMe.address);
      });

      // describe("Modifier", async function () {
      //   it("checks if its the owner", async function () {
      //     const accounts = await ethers.getSigners();
      //     const attacker = accounts[1];
      //     const attackedConnectedContract = await fundMe.connect(attacker);

      //     // const triedAttack = await attackedConnectedContract.withdrawal(); it won't work, it will throw in an error

      //     await expect(attackedConnectedContract.withdrawal()).to.be.reverted;
      //   });
      // });

      // constructor
      // describe("constructor", async function () {
      //   console.log("Hi");
      //   it("sets aggregator address properly", async function () {
      //     const chainId = network.config.chainId;
      //     const response = await fundMe.getPriceFeed();
      //     console.log(response);
      //     const ethUsdPriceAddress = networkConfig[chainId]["ethUsdPriceFeed"];
      //     console.log(ethUsdPriceAddress);
      //     assert.equal(response, ethUsdPriceAddress);
      //   });
      // });

      // allows to both fund and withdraw
      describe("allows people to fund and withdraw", async function () {
        it("checks the withdrawal function", async function () {
          await fundMe.fund({ value: sendValue });
          await fundMe.withdrawal();
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundingMe.address
          );
          assert.equal(endingFundMeBalance.toString(), "0");
        });
      });
    });
