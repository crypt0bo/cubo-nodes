require('dotenv').config()
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const TruffleContract = require('truffle-contract')
// const owner = '0xf2D61557575e87D695F9f29ddD5B7Fe9BcaF6805' // owner testnet
const owner = process.env.OWNER_WALLET

WithdrawCubo = {
  toWei: (n) => {
    return Web3.utils.toWei(n, 'ether')
  },
  setup: async () => {
    provider = new HDWalletProvider(process.env.PRIVATE_KEY, process.env.HOST_URI)
    artifact = require('../../../build/contracts/CuboIdo.json')
    CuboIdo = TruffleContract(artifact)
    CuboIdo.setProvider(provider)
    return await CuboIdo.deployed()
  },
  main: async (to, amount) => {
    console.log('start')
    let contract = await WithdrawCubo.setup()
    await contract.withdrawCuboFromIdo(to, amount, { from: owner } )
    console.log('done')
    process.exit()
  }
}

let to = process.argv[2].toString()
let amount = process.argv[3].toString()
amount = WithdrawCubo.toWei(amount)

WithdrawCubo.main(to, amount)
