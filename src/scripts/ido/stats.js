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
  setupCuboIdo: async () => {
    artifact = require('../../../build/contracts/CuboIdo.json')
    CuboIdo = TruffleContract(artifact)
    CuboIdo.setProvider(provider)
    return await CuboIdo.deployed()
  },
  setupCuboToken: async () => {
    artifact = require('../../../build/contracts/Cubo.json')
    Cubo = TruffleContract(artifact)
    Cubo.setProvider(provider)
    return await Cubo.deployed()
  },
  // setupDaiToken: async () => {
  //   artifact = require('../../../build/contracts/Dai.json')
  //   Dai = TruffleContract(artifact)
  //   Dai.setProvider(provider)
  //   return await Dai.deployed()
  // },
  main: async () => {
    console.log('start')
    let ido = await Stats.setupCuboIdo()
    let cubo = await Stats.setupCuboToken()
    // let dai = await Stats.setupDaiToken()

    // DAI contract on mainnet
    const daiContractAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'

    let daiArtifact = require('../../../build/contracts/MainnetDai.json')
    Dai = TruffleContract(daiArtifact)
    Dai.setProvider(provider)
    let dai = await Dai.at(daiContractAddress)

    console.log('IDO contract address: ' + ido.address)
    console.log('CUBO contract address: ' + cubo.address)
    console.log('DAI contract address: ' + dai.address)

    let amountDai = await dai.balanceOf(ido.address)
    console.log('DAI in IDO contract: ' + Stats.toEth(amountDai.toString()))

    let amountCubo = await cubo.balanceOf(ido.address)
    console.log('CUBO in IDO contract: ' + Stats.toEth(amountCubo.toString()))

    let cuboPrice = await ido.pricePerCuboPercent.call()
    console.log('CUBO price in IDO: ' + cuboPrice.toString())

    console.log('done')
    process.exit()
  }
}

Stats.main()
