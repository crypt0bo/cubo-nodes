require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const TruffleContract = require('truffle-contract')
// const owner = '0xf2D61557575e87D695F9f29ddD5B7Fe9BcaF6805' // owner testnet
const owner = process.env.OWNER_WALLET

BalancePool = {
  setup: async () => {
    provider = new HDWalletProvider(process.env.PRIVATE_KEY, process.env.HOST_URI)
    cuboDaoArtifact = require('../../build/contracts/CuboDao.json')
    CuboDao = TruffleContract(cuboDaoArtifact)
    CuboDao.setProvider(provider)
    return await CuboDao.deployed()
  },
  main: async () => {
    // debug with: console.log(transaction.receipt)
    console.log('start')
    let contract = await BalancePool.setup()
    await contract.balancePool({ from: owner })
    console.log('done')
    process.exit()
  }
}

BalancePool.main()
