Main = {
  loading: false,
  contracts: {},

  toEth: (n) => {
    let toEther = web3.utils.fromWei(n, 'ether')
    return toEther //.slice(0, 3) + '.' + toMilli.slice(3)
  },
  toWei: (n) => {
    return web3.utils.toWei(n, 'ether')
  },
  load: async () => {
    Main.toggleLoadingScreen(true)
    await Main.loadWeb3(true)

    await Main.setupClickCollect()
    await Main.setupClickMintNode()
    $walletBtn = $('#wallet')
    $walletBtn.on('click', async () => {
      await Main.loadWeb3(false)
    })

    await Main.setupClickProvideCubo()
    await Main.setupClickProvideDai()
    await Main.setupClickApproveDai()
    await Main.setupMetamaskEvents()
    await Main.setupClickAddTokenToWallet()
    await Main.setupClickChangeNetwork()

    $('#max-cubo').on('click', Main.maxCuboBtn)
    $('#max-dai').on('click', Main.maxDaiBtn)
    await Main.toggleLoadingScreen(false)
    console.log('loading done!')
  },

  toggleLoadingScreen: async (load) => {
    if(load) {
      $('.loading').show()
      $('.content').hide()
    }
    else {
      $('.loading').hide()
      $('.content').show()
    }
  },

  setupMetamaskEvents: async () => {
    if(typeof(ethereum) === 'undefined') { return }

    ethereum.on('accountsChanged', async () => {
      Main.toggleLoadingScreen(true)
      window.location.reload()
    });

    ethereum.on('chainChanged', async () => {
      Main.toggleLoadingScreen(true)
      window.location.reload()
    });
  },

  loadContract: async () => {
    const cuboDao = await $.getJSON('contracts/CuboDao.json')
    Main.contracts.CuboDao = TruffleContract(cuboDao)
    Main.contracts.CuboDao.setProvider(Main.web3Provider)

    const cubo = await $.getJSON('contracts/Cubo.json')
    Main.contracts.Cubo = TruffleContract(cubo)
    Main.contracts.Cubo.setProvider(Main.web3Provider)

    // DAI contract on mainnet
    const daiContractAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
    const dai = await $.getJSON('contracts/MainnetDai.json')
    Main.contracts.Dai = TruffleContract(dai)
    Main.contracts.Dai.setProvider(Main.web3Provider)

    // // DummyDAI contract on testnet
    // const daiContractAddress = '0xc67112C850964bFf0563D894130c02d6839A0EC2'
    // const dai = await $.getJSON('contracts/ExternalDai.json')
    // Main.contracts.Dai = TruffleContract(dai)
    // Main.contracts.Dai.setProvider(Main.web3Provider)

    // Mock DAI contract locally
    // const dai = await $.getJSON('contracts/Dai.json')
    // Main.contracts.Dai = TruffleContract(dai)
    // Main.contracts.Dai.setProvider(Main.web3Provider)

    try {
      Main.cuboDao = await Main.contracts.CuboDao.deployed()
      Main.cubo = await Main.contracts.Cubo.deployed()
      // Mock DAI contract locally
      // Main.dai = await Main.contracts.Dai.deployed()

      // DummyDAI / DAI contract on testnet and mainnet
      Main.dai = await Main.contracts.Dai.at(daiContractAddress)
    }
    catch {
      $('#network-alert').show()
    }
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async (firstLoad) => {
    if (typeof web3 !== 'undefined') {
      Main.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      if(!firstLoad) { window.alert("Please connect to Metamask.") }
    }
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        if(!firstLoad) { await ethereum.enable() }
      } catch {}
    }
    else if (window.web3) {
      Main.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
    }

    if(typeof web3 !== 'undefined'){ Main.accountConnected() }
  },
  accounts: async () => {
    const acc = await web3.eth.getAccounts()
    return acc
  },
  accountConnected: async () => {
    let accounts = await Main.accounts()
    if(accounts.length > 0) {
      Main.account = accounts[0]
      let acc = accounts[0]
      $('#wallet-content').html(acc.slice(0, 5) + '...' + acc.slice(acc.length - 4, acc.length))

      await Main.loadContract()
      await Main.fetchAccountData()
      await Main.fetchGeneralData()
    }
  },
  fetchGeneralData: async () => {
    let totalNodes = await Main.cuboDao.totalNodes.call()
    $('#total-nodes').html(totalNodes.toString())

    let contractAccount = await Main.cuboDao.accounts(Main.account)
    let total = contractAccount.nanoCount.toNumber() * 200
    total += contractAccount.miniCount.toNumber() * 500
    total += contractAccount.kiloCount.toNumber() * 1000
    total += contractAccount.megaCount.toNumber() * 2000
    total += contractAccount.gigaCount.toNumber() * 10000
    $('#tlv').html('$' + total.toLocaleString('us'))

    let cuboPool = await Main.cubo.balanceOf(Main.cuboDao.address)
    let formatedPoolAmount = parseInt(Main.toEth(cuboPool))
    $('#cubo-pool').html(formatedPoolAmount.toLocaleString('us'))
    $('#dai-pool').html((total / 2).toLocaleString('us'))
  },
  fetchAccountData: async () => {
    // number of nodes
    let contractAccount = await Main.cuboDao.accounts(Main.account)
    let total = contractAccount.nanoCount.toNumber() + contractAccount.miniCount.toNumber() + contractAccount.kiloCount.toNumber() +
      contractAccount.megaCount.toNumber() + contractAccount.gigaCount.toNumber()

    let totalRewards = contractAccount.nanoCount.toNumber() * 1 + contractAccount.miniCount.toNumber() * 3 + contractAccount.kiloCount.toNumber() * 7 +
      contractAccount.megaCount.toNumber() * 16 + contractAccount.gigaCount.toNumber() * 100

    $('#nano-count').html(contractAccount.nanoCount.toNumber())
    $('#nano-rewards').html(contractAccount.nanoCount.toNumber() * 1)

    $('#mini-count').html(contractAccount.miniCount.toNumber())
    $('#mini-rewards').html(contractAccount.miniCount.toNumber() * 3)

    $('#kilo-count').html(contractAccount.kiloCount.toNumber())
    $('#kilo-rewards').html(contractAccount.kiloCount.toNumber() * 7)

    $('#mega-count').html(contractAccount.megaCount.toNumber())
    $('#mega-rewards').html(contractAccount.megaCount.toNumber() * 16)

    $('#giga-count').html(contractAccount.gigaCount.toNumber())
    $('#giga-rewards').html(contractAccount.gigaCount.toNumber() * 100)

    $('#total-count').html(total)
    $('#total-rewards').html(totalRewards)

    $('#num-nodes').html(total)

    // rewards accumulated
    let interestAccumulated = Main.toEth(contractAccount.interestAccumulated)
    $('#accumulated-interest').html(interestAccumulated + ' CUBO')

    if(parseFloat(interestAccumulated) == 0){
      $('#collect-cubo').attr('disabled', 'disabled')
    }

    // wallet amount of CUBO
    cuboBalance = await Main.cubo.balanceOf(Main.account)
    $('#cubo-balance').html(Main.toEth(cuboBalance.toString()))

    // wallet amount of DAI
    daiBalance = await Main.dai.balanceOf(Main.account)
    $('#dai-balance').html(Main.toEth(daiBalance.toString()))

    let allowanceCubo = await Main.cubo.allowance(Main.account, Main.cuboDao.address)
    let allowanceDai = await Main.dai.allowance(Main.account, Main.cuboDao.address)

    if(allowanceDai > 0 && allowanceCubo > 0) {
      $('#collect-cubo').show()
      $('#node-type-modal').show()
    }
    else if(allowanceDai == 0 && allowanceCubo > 0) {
      $('#collect-cubo').show()
      $('#approve-dai').show()
      $('#approve-modal').show()
    }
    else if(allowanceDai > 0 && allowanceCubo == 0) {
      $('.approve-cubo').show()
      $('#approve-modal').show()
    }
    else {
      $('#approve-dai').show()
      $('.approve-cubo').show()
      $('#approve-modal').show()
    }

    $('#node-modal').removeAttr('disabled')
  },
  setupClickCollect: async () => {
    $('.approve-cubo').on('click', async (e) => {
      let amount = Main.toWei('1000000')
      Main.buttonLoadingHelper(e, 'approving...', async () => {
        await Main.cubo.approve(Main.cuboDao.address, amount, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Approving CUBO token...')
        })
      })
    })

    $('#collect-cubo').on('click', async (e) => {
      Main.buttonLoadingHelper(e, 'collecting...', async () => {
        await Main.cuboDao.widthrawInterest(Main.account, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Collecting CUBO to your wallet...')
        })
      })
    })
  },
  setupClickProvideCubo: async () => {
    $('#provide-cubo').on('click', async () => {
      let currentBalence = parseInt(Main.toEth(cuboBalance.toString()))
      let amountToProvide = parseInt($('#provide-cubo').data('amount'))

      if(currentBalence >= amountToProvide){
        $('#input-cubo').val(amountToProvide)
      }
    })
  },
  setupClickProvideDai: async () => {
    $('#provide-dai').on('click', async () => {
      let currentBalence = parseInt(Main.toEth(daiBalance.toString()))
      let amountToProvide = parseInt($('#provide-dai').data('amount'))

      if(currentBalence >= amountToProvide){
        $('#input-dai').val(amountToProvide)
      }
    })
  },
  setupClickApproveDai: async () => {
    $('#approve-dai').on('click', async (e) => {
      let amount = Main.toWei('100000000')
      Main.buttonLoadingHelper(e, 'approving...', async () => {
        await Main.dai.approve(Main.cuboDao.address, amount, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Approving DAI token...')
        })
      })
    })
  },
  setupClickMintNode: async () => {
    let cuboType, tokensVals

    $('#next-step-modal').on('click', async (e) => {
      cuboType = $('#cubo-type').val()

      switch(cuboType) {
        case '0':
          tokensVals = 100
          break;
        case '1':
          tokensVals = 250
          break;
        case '2':
          tokensVals = 500
          break;
        case '3':
          tokensVals = 1000
          break;
        case '4':
          tokensVals = 5000
          break;
        default:
          alert('Something went wrong!')
      }

      $('#input-cubo').attr('placeholder', tokensVals + ' CUBO')
      $('#provide-cubo').attr('data-amount', tokensVals)
      $('#input-dai').attr('placeholder', tokensVals + ' DAI')
      $('#provide-dai').attr('data-amount', tokensVals)
      $('.token-vals').html(tokensVals)
      $('#mint-node').attr('data-amount', tokensVals)
      $('#mint-node').attr('data-cubo-type', cuboType)

      $('#node-type-modal').hide()
      $('#mint-modal').show()
    })

    $('#mint-node').on('click', async (e) => {
      let cuboAmount = $('#input-cubo').val()
      let daiAmount = $('#input-dai').val()
      let amountToProvide = $(e.target).data('amount')
      let cuboType = $(e.target).data('cubo-type')

      if(cuboAmount < amountToProvide || daiAmount < amountToProvide){
        alert('You need to provide ' + amountToProvide + ' CUBO and ' + amountToProvide + ' DAI to mint a node')
        return
      }

      Main.buttonLoadingHelper(e, 'minting...', async () => {
        await Main.cuboDao.mintNode(
          Main.account,
          Main.toWei(cuboAmount),
          Main.toWei(daiAmount),
          cuboType,
          { from: Main.account }
        ).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Minting Cubo node...')
        })
      })
    })
  },
  setupClickAddTokenToWallet: async () => {
    $('#add-token').on('click', async (e) => {
      Main.addTokenToWallet()
    })
  },
  addTokenToWallet: async () => {
    await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: Main.cubo.address, // The address that the token is at.
          symbol: 'CUBO', // A ticker symbol or shorthand, up to 5 chars.
          decimals: 18 // The number of decimals in the token
        }
      }
    })
  },
  setupClickChangeNetwork: async () => {
    $('#change-network').on('click', async (e) => {
      Main.changeWalletNetwork()
    })
  },
  changeWalletNetwork: async () => {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params:[ { chainId: '0x89' } ]
    });
  },

  // helper functions
  buttonLoadingHelper: async (event, loadingText, callback) => {
    $btn = $(event.target)
    $btn.attr('disabled', 'disabled')
    $btn.html(loadingText)
    try {
      await callback()
    } catch {
      alert('Something went wrong, please refresh and try again.')
      window.location.reload()
    }
    window.location.reload()
  },
  handleTransaction: async (txHash, message) => {
    $('#create-node').modal('hide')
    $modal = $('#tx-alert')
    $modal.find('#tx-link').attr('href', 'https://polygonscan.com/tx/' + txHash)
    $modal.find('#tx-message').html(message)
    $modal.modal('show')
  }
}

$(() => {
  $(window).load(() => { Main.load() })
})
