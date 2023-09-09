const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

// console.log("Hi");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      console.log("Hey, in here!");
      let fundMe;
      let deployer;
      let MockV3Aggregator;
      const sendValue = ethers.parseEther("1.0");
      // let simpleStorageFactory;
      // let simpleStorage;
      let mockV3Aggregator;
      let fundingMe;
      beforeEach(async function () {
        // deploy our fundMe contract
        // using hardhat-deploy
        // const accounts = await ethers.getSigners();
        // const accountZero = accounts[0];
        console.log("Yh, I'm here");
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        // console.log(deployer);
        fundingMe = await deployments.get("FundMe"); // OR fundingMe = await deployments.get("FundMe", deployer);
        // console.log(fundingMe.address);
        fundMe = await ethers.getContractAt("FundMe", fundingMe.address);
        // console.log(fundMe);
        // simpleStorageFactory = await ethers.getContractFactory("FundMe");
        // simpleStorage = await simpleStorageFactory.deploy(deployer);

        mockV3Aggregator = await deployments.get("MockV3Aggregator", deployer);
        // MockV3Aggregator = await ethers.getContractAt(
        //   "MockV3Aggregator",
        //   mockV3Aggregator.address
        // ); Since we have no variables  we are interactin with, no nned for this
      });

      describe("constructor", async function () {
        it("sets the aggregator address correctly", async function () {
          console.log("I'm in the constructor");
          const response = await fundMe.getPriceFeed();

          console.log(response);
          console.log(mockV3Aggregator.address);
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("Fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough!");
        });

        it("Updated the getFunders list", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getFunders(0);
          // const expectedFunder = deployer.address;
          // console.log(expectedFunder);
          assert.equal(response, deployer);
        });

        it("Updated the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response, sendValue);
        });
      });

      describe("Withdrawals", async function () {
        beforeEach(async function () {
          // const startingFundMeBalance = await ethers.provider.getBalance(
          //   fundingMe.address
          // );
          // console.log(startingFundMeBalance);
          // const startingDeployerBalance = await ethers.provider.getBalance(
          //   deployer
          // );
          // console.log(startingDeployerBalance);

          await fundMe.fund({ value: sendValue });
        });

        it("withdraws from a single funder", async function () {
          // Arrange
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundingMe.address
          );
          console.log(startingFundMeBalance);
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          console.log(startingDeployerBalance);
          // Act
          const transactionResponse = await fundMe.withdrawal();
          const transactionReceipt = await transactionResponse.wait(1);
          // const { gasUsed, gasPrice } = transactionReceipt;
          // const gasCost = gasUsed * gasPrice; fee is the multiplication of the both of them
          const { fee } = transactionReceipt;

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundingMe.address
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          console.log(endingFundMeBalance);
          console.log(fee);
          // Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + fee
          );
        });

        // Cheaper withdraw (single funder)
        it("withdraws from a single funder using cheaper withdrawal", async function () {
          // Arrange
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundingMe.address
          );
          console.log(startingFundMeBalance);
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          console.log(startingDeployerBalance);
          // Act
          const transactionResponse = await fundMe.cheaperWithdrawal();
          const transactionReceipt = await transactionResponse.wait(1);
          // const { gasUsed, gasPrice } = transactionReceipt;
          // const gasCost = gasUsed * gasPrice; fee is the multiplication of the both of them
          const { fee } = transactionReceipt;

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundingMe.address
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          console.log(endingFundMeBalance);
          console.log(fee);
          // Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + fee
          );
        });

        // it.only("cleans the list of getFunders", async function () {
        //   const justFundedList = await fundMe.getFunders(0);
        //   console.log(justFundedList);
        //   const transactionResponse = await fundMe.withdrawal();
        //   const transactionReceipt = await transactionResponse.wait(1);
        //   console.log("Hi, hi");
        //   const response = await fundMe.getFunders(0);
        //   console.log("Another hi");
        //   console.log(response);

        //   assert.equal(response, 0);

        //   console.log(response);
        // });

        it("allows to withdraw multiple getFunders", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            // console.log(accounts[i]);
            const fundedConnectedContract = await fundMe.connect(accounts[i]);
            await fundedConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundingMe.address
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.withdrawal();
          const transactionReceipt = await transactionResponse.wait(1);
          const { fee } = transactionReceipt;
          const endFundMeBalance = await ethers.provider.getBalance(
            fundingMe.address
          );
          const endDeployerBalance = await ethers.provider.getBalance(deployer);
          console.log(startingFundMeBalance);
          console.log(startingDeployerBalance);
          console.log(endDeployerBalance);
          console.log(fee);

          assert.equal(endFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endDeployerBalance + fee
          );

          // Made sure that the getFunders array is reset properly
          await expect(fundMe.getFunders(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
            // console.log(`${i}: Empty`);
          }
        });

        // Testing modifiers
        it("Only owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);

          // await expect(attackerConnectedContract.withdrawal()).to.be.revertedWith(
          //   "FundMe__NotOwner"
          // ); // Didn't see get the custom error it was reverting with from the solidity code
          await expect(attackerConnectedContract.withdrawal()).to.be.reverted;
        });

        // Cheap withdrawals
        it("allows cheap withdrawal", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            // console.log(accounts[i]);
            const fundedConnectedContract = await fundMe.connect(accounts[i]);
            await fundedConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundingMe.address
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.cheaperWithdrawal();
          const transactionReceipt = await transactionResponse.wait(1);
          const { fee } = transactionReceipt;
          const endFundMeBalance = await ethers.provider.getBalance(
            fundingMe.address
          );
          const endDeployerBalance = await ethers.provider.getBalance(deployer);
          console.log(startingFundMeBalance);
          console.log(startingDeployerBalance);
          console.log(endDeployerBalance);
          console.log(fee);

          assert.equal(endFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endDeployerBalance + fee
          );

          // Made sure that the getFunders array is reset properly
          await expect(fundMe.getFunders(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
            // console.log(`${i}: Empty`);
          }
        });
      });
    });
