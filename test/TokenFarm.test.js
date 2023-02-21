const DaiToken  = artifacts.require("DaiToken")
const DappToken = artifacts.require("DappToken")
const TokenFarm = artifacts.require("TokenFarm")

require('chai')
	.use(require('chai-as-promised'))
	.should()

function tokens(n) {
	return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
	let daiToken, dappToken, tokenFarm

	before(async () => {
		// Load contracts
		daiToken = await DaiToken.new()
		dappToken = await DappToken.new()
		tokenFarm = await TokenFarm.new(daiToken.address, dappToken.address)

		// transfer all dappTokens to tokenfarm 1M
		await dappToken.transfer(tokenFarm.address, tokens('1000000'))

		// Send 100 token to Investor
		await daiToken.transfer(investor, tokens('100'), {from: owner})
	})

	//Test case goes here
	describe("Mock DAI deployment", async () => {
		it("has a name", async () => {
			const name = await daiToken.name()
			assert.equal(name, "Mock DAI Token")
		})
	})

	describe("Dapp Token deployment", async () => {
		it("has a name", async () => {
			const name = await dappToken.name()
			assert.equal(name, "DApp Token")
		})
	})

	describe("Token Farm deployment", async () => {
		it("has a name", async () => {
			const name = await tokenFarm.name()
			assert.equal(name, "Dapp Gourav")
		})

		it("Contract has tokens", async () => {
			let balance = await dappToken.balanceOf(tokenFarm.address)
			assert.equal(balance, tokens('1000000'))
		})
	})

	describe("Farming tokens", async () => {
		it("rewards investor for staking mDai tokens", async () => {
			let result

			// check investor balance before staking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), "Investor balnce is correct before staking")

			// Stake M Dai Tokens #which needs approval as well.
			await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
			await tokenFarm.stakeTokens(tokens('100'), {from: investor})

			// Check staking result
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('0'), 'investor mock dai balance is correct after staking')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('100'), 'Token Farm Mock Dai balance is correct after staking')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('100'), 'investor staking balance is correct after staking')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'true', 'investor staking status is correct')		
			
			//Issue Tokens
			await tokenFarm.issueTokens({from: owner})	

			//check balance after issuance
			result = await dappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), "investor dapp token balance correct after issuance")

			//only owner can issue tokens
			await tokenFarm.issueTokens({from: investor}).should.be.rejected;	

			//unstake the tokens
			await tokenFarm.unstakeTokens({from: investor})

			//check results after unstaking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens("100"), "investor mock dai balance correct after unstaking")

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens("0"), "Token Farm mock dai balance correct after unstaking")

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens("0"), "investor staking balance correct after unstaking")

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'false', "investor staking status is correct after unstaking")
		})
	})

})


