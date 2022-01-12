require('dotenv').config()
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const TruffleContract = require('truffle-contract')
// const owner = '0xf2D61557575e87D695F9f29ddD5B7Fe9BcaF6805' // owner testnet
const owner = process.env.OWNER_WALLET
const provider = new HDWalletProvider(process.env.PRIVATE_KEY, process.env.HOST_URI)

Stats = {
  toWei: (n) => {
    return Web3.utils.toWei(n, 'ether')
  },
  toEth: (n) => {
    return Web3.utils.fromWei(n, 'ether')
  },
  setupCuboDao: async () => {
    artifact = require('../../build/contracts/CuboDao.json')
    CuboDao = TruffleContract(artifact)
    CuboDao.setProvider(provider)
    return await CuboDao.deployed()
  },
  setupCuboToken: async () => {
    artifact = require('../../build/contracts/Cubo.json')
    Cubo = TruffleContract(artifact)
    Cubo.setProvider(provider)
    return await Cubo.deployed()
  },
  setupDaiToken: async () => {
    artifact = require('../../build/contracts/Dai.json')
    Dai = TruffleContract(artifact)
    Dai.setProvider(provider)
    return await Dai.deployed()
  },
  main: async () => {
    console.log('start')
    let dao = await Stats.setupCuboDao()
    let cubo = await Stats.setupCuboToken()

    // let dai = await Stats.setupDaiToken()

    // DAI contract on mainnet
    const daiContractAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
    let daiArtifact = require('../../build/contracts/MainnetDai.json')
    Dai = TruffleContract(daiArtifact)
    Dai.setProvider(provider)
    let dai = await Dai.at(daiContractAddress)

    console.log('DAO contract address: ' + dao.address)
    console.log('CUBO contract address: ' + cubo.address)
    console.log('DAI contract address: ' + dai.address)

    let cuboInterestRatePercent = await dao.cuboInterestRatePercent.call()
    console.log('Interest per node: ' + (cuboInterestRatePercent.toNumber() / 100))

    let amountDai = await dai.balanceOf(dao.address)
    console.log('DAI in contract: ' + Stats.toEth(amountDai.toString()))

    let amountCubo = await cubo.balanceOf(dao.address)
    console.log('CUBO in contract: ' + Stats.toEth(amountCubo.toString()))

    let totalNodes = await dao.totalNodes.call()
    console.log(totalNodes.toNumber())
    let cuboNodesAddresses = await dao.cuboNodesAddresses.call(1)
    console.log(cuboNodesAddresses)

    console.log('done')
    process.exit()
  }
}

Stats.main()
