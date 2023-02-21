const DaiToken  = artifacts.require("DaiToken")
const DappToken = artifacts.require("DappToken")
const TokenFarm = artifacts.require("TokenFarm")

module.exports = async function(deployer, network, accounts) {
  // Deploy Dai Token
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  // Deploy Dapp Token
  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()

  // Deploy TokenFarm
  await deployer.deploy(TokenFarm, daiToken.address, dappToken.address)
  const tokenFarm = await TokenFarm.deployed()

  // transfer all Dapp tokens to TokenFarm(1M) so that when user stake we give contract give them Dapp as interest
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // Transfer 100 Mock Dai Token to investor 
  await daiToken.transfer(accounts[1], '100000000000000000000')

  //Initial Deployment
  //deployer.deploy(TokenFarm)
  // truffle console
  // tokenFarm = await TokenFarm.deployed() 
  // note: deployed() will act as promise with await
};
