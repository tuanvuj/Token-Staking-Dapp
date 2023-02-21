pragma solidity ^0.5.0;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm {

	string public name = "Dapp Gourav";
	address public owner;
	DaiToken public daiToken;
	DappToken public dappToken;

	address[] public stakers;
	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;

	constructor(DaiToken _daiToken, DappToken _dappToken) public {
		daiToken = _daiToken;
		dappToken = _dappToken;
		owner = msg.sender;
	}

	//Stake tokens (Deposit)
	function stakeTokens(uint _amount) public {

		//Require amount greater than 0
		require(_amount >0, "amount cannot be zero");
	
		// transfet mock dai token for this contract for staking
		daiToken.transferFrom(msg.sender, address(this), _amount);

		//Update staking balance
		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount; 

		// Add users to staker array only if its first time or they dont have any stake till now
		if(!hasStaked[msg.sender]) {
			stakers.push(msg.sender);
		}

		// change the status to true when sender stakes
		isStaking[msg.sender] = true;
		hasStaked[msg.sender] = true;

	}

	//Issue a interest in DappToken for the one staked
	 function issueTokens() public {
	 	// only owner can call this function
	 	require(msg.sender == owner, "caller must be owner");

	 	// issue token to stakers
	 	for(uint i=0; i<stakers.length; i++) {
	 		address recipient = stakers[i];
	 		uint balance =  stakingBalance[recipient];
	 		if(balance > 0){
	 			dappToken.transfer(recipient, balance);
	 		}
	 	}
	 }

	 //unstake tokens
	 function unstakeTokens() public {
	 	// Fetch staking balance
	 	uint balance = stakingBalance[msg.sender];
	 	
	 	// require staking balance greater than 0
	 	require(balance > 0, "staking balance cannot be 0");

	 	//transfer back the token to user
	 	daiToken.transfer(msg.sender, balance);

	 	//update his staking balance
	 	stakingBalance[msg.sender] = 0;

	 	//update staking status
	 	isStaking[msg.sender] = false;

	 }

}