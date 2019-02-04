import Web3Service from './web3'
import Contracts from './res/contracts'
import BigNumber from 'bignumber.js'

// export the contract details so we can import them from elsewhere
export { default as Contracts } from './res/contracts'
export { default as Web3Service } from './web3'

/**
 *  Sends the approve transaction to the token contract, allowing the multisender contract to move
 *  tokens.
 *  @param tokenAddress {String} Public address of the token to be approved
 *  @param approvedAmount {Number} Number of tokens to approve
 *  @return {Promise<String>} Transaction hash of the approval transaction
 */
export const approveMultisender = async (tokenAddress, tokensToApprove) => {
  const web3 = await Web3Service.getWeb3()
  const tokenContract = await getTokenContract(tokenAddress)
  const accounts = await web3.eth.getAccounts()

  return new Promise(async (resolve, reject) => {
    try {
      const allowance = await tokenContract.methods.allowance(accounts[0], Contracts.Multisender.address).call();
      const bn = new BigNumber(allowance, 10)
      if(bn.gte(tokensToApprove)){
        resolve({ approved: true })
      } else {
        resolve({ method: tokenContract.methods.approve(Contracts.Multisender.address, tokensToApprove) })
      }
    } catch (e) {
      console.log(e)
      reject(e)
    }    
  })
}

export const getDefaultAccount = async () => {
  const web3 = await Web3Service.getWeb3()
  if (web3.eth.accounts && web3.eth.accounts[0]) {
    return web3.eth.accounts[0]
  }
  return false
}

/**
  TODO : docs
 */
export const prepareSend = async (tokenAddress, recipients, amounts) => {
  if (recipients.length !== amounts.length) throw new Error('Participants and amounts arrays should be equal length')
  if (recipients.length > 255) throw new Error('Arrays cannot be larger than 255 in length, please send multiple transactions')
  const multisendContract = await getMultisendContract()
  return multisendContract.methods.multiSend(tokenAddress, recipients, amounts);
}

/**
 *  Gets the number of decimals for the token at a given address
 *  @param tokenAddress {String} Public address of the token
 *  @return {Promise<Number>} Number of decimals of the token
 */
export const getDecimals = async (tokenAddress) => {
  const tokenContract = await getTokenContract(tokenAddress)
  return new Promise((resolve, reject) => {
    tokenContract.decimals.call((e, res) => {
      if (e) return reject(e)
      resolve(res)
    })
  })
}

/**
 *  Gets the balance of a given user for a given token
 *  @param tokenAddress {String} Public address of the token
 *  @param userAddress {String} Public address of the user
 *  @return {Promise<BigNumber>} Balance of the user
 */
export const getTokenBalance = async (tokenAddress, userAddress) => {
  const tokenContract = await getTokenContract(tokenAddress)
  return tokenContract.methods.balanceOf(userAddress).call()
}

/**
 *  Gets the symbol of a given token
 *  @param tokenAddress {String} Public address of the token
 *  @return {Promise<String>} Symbol of the token
 */
export const getTokenSymbol = async (tokenAddress) => {
  const tokenContract = await getTokenContract(tokenAddress)
  return tokenContract.methods.symbol().call()
}

/**
 *  Gets the decimals of a given token
 *  @param tokenAddress {String} Public address of the token
 *  @return {Promise<String>} Decimals of the token
 */
export const getTokenDecimals = async (tokenAddress) => {
  const tokenContract = await getTokenContract(tokenAddress)
  return tokenContract.methods.decimals().call()
}

/**
 *  Gets the ETH balance of a given user
 *  @param userAddress {String} Public address of the user
 *  @return {Promise<Number>} Balance of the user in ETH
 */
export const getEthBalance = async (userAddress) => {
  const web3 = await Web3Service.getWeb3()
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(userAddress, (e, res) => {
      if (e) return reject(e)
      resolve(web3.fromWei(res, 'ether'))
    })
  })
}

/**
 *  Returns the web3 instance from Web3Service
 *  @return {Promise<Object>} Web3 instance
 */
export const getWeb3 = async () => {
  return await Web3Service.getWeb3()
}


export const batchRecipients = (data, decimal, batchSize=200) => {
  let chunks = []
 // let total = new BigNumber(0);
  let chunkIndex = -1;
  
  data.forEach( (tx, i) => {
    if (i % batchSize === 0) {
      chunkIndex ++
      chunks[chunkIndex] = {
        recipients : [],
        amounts : []
      }
    }
    
    // amount as big number
    let amount = new BigNumber(tx.recipient_amount).mul(Math.pow(10, decimal))
    
    // add recipient item
    chunks[chunkIndex].recipients.push(tx.recipient_address)
    chunks[chunkIndex].amounts.push(amount);
    
    // add to total
    //total = total.plus(amount);
  });
  
  return chunks
}

export const countTokens = (txs, decimal) => {
  let int = txs.reduce((acc, tx) => {return acc += tx.recipient_amount}, 0)
  let bn = new BigNumber(int).mul(Math.pow(10, decimal))

  return {
    int : int,
    bn : bn
  }
}

// export const calculateTotal = (data, decimal) => {
//   let total = new BigNumber(0);
//   return data.reduce((acc, tx) => {return acc += new BigNumber(tx.recipient_amount).mul(Math.pow(10, decimal))}, new BigNumber(0))
// }







/**
 *  Instantiates a Web3 contract object with the ERC20 standard ABI at the given contract address
 *  @param tokenAddress {String} Public address of the token
 *  @return {Object} Web3 contract object
 */
const getTokenContract = async (tokenAddress) => {
  const web3 = await Web3Service.getWeb3()
  return new web3.eth.Contract(Contracts.Token.abi, tokenAddress)
  //return new web3.eth.Contract(Contracts.Token.abi).at(tokenAddress)
}

/**
 *  Instantiates a Web3 contract object with the Multisender ABI at the Multisender address
 *  @return {Object} Web3 contract object
 */
const getMultisendContract = async () => {
  const web3 = await Web3Service.getWeb3()
  return new web3.eth.Contract(Contracts.Multisender.abi, Contracts.Multisender.address)
}







/**

amountInSmallestUnit = amountOfTokens * (10 ^ numberOfDecimals)

10000000 = 10 * (10 ^ 6)

TokenContract
  - approve(address spenderAddress, uint256 approvedAmount)
      Tells the TokenContract, that the account denoted by spenderAddress has
      permission to move approvedAmount of tokens out of the caller's account

Multisender
  - multisend(address tokenAddress, address[] recipients, uint256[] amounts)
      Tells the multisender contract to transfer an amount of tokens from
      sender's address to each participant, using seqeuntial array indices to
      specify the amount

address[1] -> amounts[1]
address[528] -> amounts[528]

*/