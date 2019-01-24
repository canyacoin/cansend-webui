import Web3 from 'web3'

const funcs = {

  getWeb3: () => {
    return new Promise((resolve) => {
      let web3
      if (typeof window.web3 === 'undefined') {
        console.error('No Web3 detected, falling back to default mode')
        web3 = new Web3(Web3.providers.HttpProvider('https://mainnet.infura.io/T1YIsUqqHW568dijGClq'))
      } else {
        web3 = new Web3(window.web3.currentProvider)
        web3.eth.defaultAccount = window.web3.eth.defaultAccount
      }
      resolve(funcs.amendWeb3(web3))
    })
  },

  waitForConfirmation: (txHash) => {
    return new Promise(async (resolve) => {
      const web3 = await funcs.getWeb3()
      const receipt = await web3.eth.getTransactionReceiptMined(txHash)
      resolve(receipt)
    })
  },

  amendWeb3: (web3) => {
    web3.eth.getTransactionReceiptMined = (txnHash, interval) => {
      var transactionReceiptAsync
      interval = interval ? interval : 500
      transactionReceiptAsync = (txnHash, resolve, reject) => {
        web3.eth.getTransactionReceipt(txnHash, (e, receipt) => {
          if (receipt == null) {
            setTimeout(() => {
              transactionReceiptAsync(txnHash, resolve, reject)
            }, interval)
          } else {
            resolve(receipt)
          }
        })
      }

      if (Array.isArray(txnHash)) {
        var promises = []
        txnHash.forEach((oneTxHash) => {
          promises.push(web3.eth.getTransactionReceiptMined(oneTxHash, interval))
        })
        return Promise.all(promises);
      } else {
        return new Promise((resolve, reject) => {
          transactionReceiptAsync(txnHash, resolve, reject)
        })
      }
    }

    return web3
  }

}




export default funcs