// SPDX-License-Identifier: MIT
// 1. pragma
pragma solidity ^0.8.7;

// Get funds from users
// Withdraw funds

// 2. imports
import "./PriceConverter.sol";
import "hardhat/console.sol";

// 3. error codes
error FundMe__notOwner();

// 4. Interfaces, Libraries, Contracts

//-------------------------------------

/**
 * @title A contract for funding
 * @author Adamsdave
 * @notice This contract is a funding contract
 * @dev This implements price feeds as our library
 */

contract FundMe {
    // Types variables
    using PriceConverter for uint256;

    // State Variables
    uint256 public constant minimumUsd = 50 * 1e18;
    address[] private funders;
    address private immutable i_owner;
    mapping(address => uint256) private addressToAmountFunded;
    AggregatorV3Interface private priceFeed;

    // Events (we have none)

    // Modifiers
    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Sender not owner"); The string takes up too much space.
        if (msg.sender != i_owner) revert FundMe__notOwner(); // This saves gas
        _;
    }

    // Functions Order:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice This function funds this contract
     * @dev this implements price feeds as our library
     */
    function fund() public payable {
        //number = 5;
        require(
            msg.value.getConversionRate(priceFeed) >= minimumUsd,
            "Didn't send enough!"
        ); // 1e18(wei) = 1 * 10**18 = 1eth
        // If it fails it reverts the transanction and doesn't take execution cost
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdrawal() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // Reserring Arrays
        funders = new address[](0);

        // To actually withdraw funds
        /* transfer is capped at 2300 gas and throws an error if it fails
        payable(msg.sender).transfer(address(this).balance);

        // send is also capped at 2300 gas and sends a bool
        bool sendSuccess = payable(msg.sender).send(address(this).balance);
        require(sendSuccess, "Send Failed");*/

        // call is lower level function
        (bool callSuccess /* bytes memory */, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }

    // Cheaper withdrawal
    function cheaperWithdrawal() public payable onlyOwner {
        address[] memory fundersLocal = funders;
        // mappings can't be in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < fundersLocal.length;
            funderIndex++
        ) {
            address funder = fundersLocal[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed!");
    }

    // view / pure functions

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}
