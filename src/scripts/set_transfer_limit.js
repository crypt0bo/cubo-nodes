require('dotenv').config()
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const TruffleContract = require('truffle-contract')
const owner = process.env.OWNER_WALLET
const provider = new HDWalletProvider(process.env.PRIVATE_KEY, process.env.HOST_URI)

SetTransferLimit = {
  toWei: (n) => {
    return Web3.utils.toWei(n, 'ether')
  },
  toEth: (n) => {
    return Web3.utils.fromWei(n, 'ether')
  },

  setupCuboToken: async () => {
    artifact = require('../../build/contracts/Cubo.json')
    Cubo = TruffleContract(artifact)
    Cubo.setProvider(provider)
    return await Cubo.deployed()
  },
  main: async () => {
    console.log('start')
    let cubo = await SetTransferLimit.setupCuboToken()
    await cubo.setTranferLimit(SetTransferLimit.toWei('10000'), { from: owner })
    console.log('done')
    process.exit()
  }
}

SetTransferLimit.main()
