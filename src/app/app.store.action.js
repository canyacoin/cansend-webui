import md5 from 'md5';
import BigNumber from 'bignumber.js'
import { NotificationType } from 'app.elements'
import { AccountStatus, HistoryStatus, MultisendSummaryStatus, MultisendBatchStatus, MultisendTokenStatus } from 'app/app.store.reducer'
import { approveMultisender, batchRecipients, countTokens, prepareSend, getWeb3, estimateTransferCost, Contracts, Web3Service, getTokenSymbol, getTokenDecimals, getTokenBalance } from 'app.contract' 
import config from 'app.config'


/* redux actions */

export const notificationAdd = (text, type, duration, identifier) => {
	return {
		type : 'APP.NOTIFICATION.ADD',
		item : {
			id : md5(text + Date() + Math.random()),
			text : text,
			type : type || NotificationType.NOTIFICATION,
			duration : duration,
			identifier : identifier
		} 
	}
}

export const notificationRemove = (id) => {
	return {
		type : 'APP.NOTIFICATION.REMOVE',
		id : id	
	}
}

export const dragDrop = (visible) => {
	return {
		type : 'APP.DRAGDROP.VISIBLE',
		visible : visible	
	}
}

export const openDialog = (text, options) => ({
	type : 'APP.DIALOG.OPEN',
	text : text,
	options : options
})

export const closeDialog = (text, options) => ({
	type : 'APP.DIALOG.CLOSE'
})

export const transactionRecipientsAdd = (recipients) => {
	return {
		type : 'APP.TRANSACTION.RECIPIENTS.ADD',
		recipients : recipients	
	}
}

export const transactionFieldsAdd = (fields) => {
	return {
		type : 'APP.TRANSACTION.FIELDS.ADD',
		fields : fields
	}
}

export const accountUpdate = (account) => {
	return {
		type : 'APP.ACCOUNT.UPDATE',
		account : account,
	}
}

export const setTransactionStatus = (index, status) => {
	return {
		type : 'APP.TRANSACTION.STATUS.UPDATE',
		index : index,
		status : status
	}
}

export const setSummary = (summary) => ({
	type : 'APP.TRANSACTION.SUMMARY.UPDATE',
	summary : summary
})

export const updateBatchStatus = (index, data) => ({
	type : 'APP.TRANSACTION.BATCH.UPDATE',
	index : index, 
	data : data
})

export const historyUpdate = (data) => {
	return async (dispatch, getState) => {
		dispatch({
			type : 'APP.HISTORY.UPDATE',
			data : data 
		})
		if (data.items) {
			for (let tx of data.items) {
				dispatch(updateFromTXReceipt(tx.hash))
			}
		}
	}
}

export const historyItemUpdate = (hash, data) => ({
	type : 'APP.HISTORY.ITEM.UPDATE',
	hash : hash,
	data : data
})

export const tokenUpdate = (key, value) => ({
	type : 'APP.TOKEN.UPDATE',
	key : key,
	value : value
})

export const multisendUpdate = (data) => ({
	type : 'APP.MULTISEND.UPDATE',
	data : data
})

export const multisendTokenUpdate = (data) => ({
	type : 'APP.MULTISEND.TOKEN.UPDATE',
	data : data
})





/* async actions */

// export const progressMultisender = (history) => {
// 	return async (dispatch, getState) => {
// 		let nextStep = getState().multisend.step + 1;
		
// 		dispatch(multisendUpdate({
// 			step : nextStep
// 		}))
		
// 		switch (nextStep) {
// 			case 2:
// 				history.push('/buy-credits')
// 				break;
// 			case 3:
// 				history.push('/send')
// 				break;
// 			default:
// 				history.push('/')
// 				break;
// 		}
		
// 	}
// }

export const fetchTokenMeta = (token_address, account_address) => {
	return async (dispatch, getState) => {

		dispatch(multisendUpdate({
			token_address: token_address,
			token_decimal : null,
			token_symbol : null,
			token_status : MultisendTokenStatus.FETCHING,
			token_balance: null
		}))

		const web3 = await getWeb3()
		
		// not an address ? 
		if (!web3.utils.isAddress(token_address)) {
			dispatch(multisendUpdate({
				token_status: MultisendTokenStatus.ERROR
			}))
			return;
		}
		
		try {
			const decimals = await getTokenDecimals(token_address)
			const symbol = await getTokenSymbol(token_address)
			const userBalance = await getTokenBalance(token_address, account_address)

			dispatch(multisendUpdate({
				token_address: token_address,
				token_decimal: decimals,
				token_symbol: symbol,
				token_status: MultisendTokenStatus.SUCCESS,
				token_balance: userBalance
			}))
			
		} catch (e) {
			dispatch(multisendUpdate({
				token_status : MultisendTokenStatus.ERROR
			}))
		}
	}
}

// fetch token name
export const fetchTokenName = (address) => {
	return (dispatch, getState) => {
		let state = getState();

		getWeb3().then( async web3 => {
			
			// state.tokens[address] :
			// -1 : not set 
			// 0 : fetching
			// 1 : unknown
			// [string] : name
			
			// if we don;t have the address, or address is -1 (pending lookup)
			if(!state.tokens[address] || state.tokens[address] === -1){
				dispatch(tokenUpdate(address, 0));
				const symbol = await getTokenSymbol(address)
				dispatch(tokenUpdate(address, symbol))
			}
		})
	}
}

// fetch number of multisend recipients for a tx
export const updateFromTXReceipt = (hash) => {
	return (dispatch, getState) => {
		getWeb3().then( web3 => {
			web3.eth.getTransactionReceipt(hash, (e, tx) => {
				dispatch(historyItemUpdate(hash, {
					recipient_count : tx.logs.length-2,
					logs : tx.logs,
					status : tx.status
				}))
			})
		})
	}
}

// fetch recent multisend transactions
export const fetchRecentTransactions = (blocks=5000, force) => {
	return (dispatch, getState) => {

		let state = getState();

		if(state.account.address !== state.txhistory.address || force === true || blocks !== state.txhistory.blocks){
			
			// update transaction in state
			dispatch(historyUpdate({
				address : state.account.address,
				status : HistoryStatus.FETCHING,
				blocks : blocks
				//items : []
			}))

			getWeb3().then( web3 => {
				web3.eth.getBlockNumber().then( currentblock => {
					
					web3.eth.getPastLogs({
						address : Contracts.Multisender.address,
						topics : ['0xae637eca67ac0a1d7fa5787a59e22249aad93026ca046fef09cc3850954440bd'],
						fromBlock : web3.utils.toHex(currentblock - blocks),
						toBlock : 'pending'
					}, async (error, txs) => {

						//console.log(txs)

						let status = HistoryStatus.EMPTY
						let items = [];

						if(txs.length > 0){
							status = HistoryStatus.SUCCESS;
							items = await txs.reverse().map(async tx => {

								// get token address
								let token_address = tx.topics[1].slice(-40)
								
								// fetch recipient count
								dispatch(updateFromTXReceipt(tx.transactionHash))

								// fetch token name
								dispatch(fetchTokenName(token_address))

								const decimals = await getTokenDecimals(token_address)
								
								return new Promise(resolve => resolve({
									status : null,
									block : tx.blockNumber,
									amount : new BigNumber('0x' + tx.data.slice(- tx.data.length + 2).match(/.{1,64}/g)[0]).div(Math.pow(10, decimals)).toNumber(),
									token : token_address,
									recipient_count : -1,
									hash : tx.transactionHash,
									logs : []
								}))
							})
						}
					
						// dispatch new transactions
						dispatch(historyUpdate({
							address : state.account.address,
							status : status,
							items : await Promise.all(items)
						}))
					})
				})
			})
		}
	}
}

// create transaction chunks and calculate all values for summary page
export const summariseTransactions = () => {
	return async (dispatch, getState) => {

		let state = getState();
    let token_count = countTokens(state.multisend.recipients, state.multisend.token_decimal)
    let gasCost = await estimateTransferCost(state.multisend.token_address);
    const batchSize = gasCost ? Math.floor((config.max_gas_limit - 100000) / gasCost) : (config.tx_batch_size || 150);
		let batches = batchRecipients(state.multisend.recipients, state.multisend.token_decimal, batchSize);

		dispatch(setSummary({
			from_token_address : state.multisend.token_address,
			from_token_decimal : state.multisend.token_decimal,
			can_fee : Math.floor(state.multisend.recipients.length / config.address_per_can),
			address_count : state.multisend.recipients.length,
			token_count_int : token_count.int,
			token_count_bn : token_count.bn,
			status : MultisendSummaryStatus.INITIALIZED,
			batches : batches.map( batch => ({
				status : MultisendBatchStatus.PENDING,
				message : '',
				items : batch,
				hash : null,
				receipt : null
			}))
		}))
	}
}

// process next transaction in the transaction array
export const processTransactions = () => {
	return async (dispatch, getState) => {
		
		dispatch(setSummary({
			status : MultisendSummaryStatus.PROCESSING
    }));

		let state = getState();
		let SENDING_CAN = false
		const web3 = await Web3Service.getWeb3()
		const accounts = await web3.eth.getAccounts()
    const canTokenDecimals = await getTokenDecimals(Contracts.Token.address)
    

		// get the multisend token address
		const multisendTokenAddress = state.multisend.token_address.toLowerCase()

		// get the can token address 
		const canTokenAddress = Contracts.Token.address.toLowerCase()

		let tokensToApprove = state.multisend.summary.token_count_bn
		if (multisendTokenAddress === canTokenAddress) SENDING_CAN = true

		try {
			if (SENDING_CAN) {
				tokensToApprove = tokensToApprove.add(state.multisend.summary.can_fee * (Math.pow(10, canTokenDecimals)))
			} else {
				await approveMultisender(canTokenAddress, (state.multisend.summary.can_fee * Math.pow(10, canTokenDecimals)))
      }
      

			approveMultisender(state.multisend.summary.from_token_address, tokensToApprove).then( approved => {
				if(!approved) throw new Error('Not approved!')

				// itterate each batch
				state.multisend.summary.batches.forEach( (batch, i) => {

					// prepare the token send method 
					prepareSend(state.multisend.summary.from_token_address, batch.items.recipients, batch.items.amounts).then(method => {
            
            // estimate gas && ensure func can be sent
            method.estimateGas({ from: accounts[0] }).then(gas => {
              
              if(gas >= config.max_gas_limit){
                dispatch(updateBatchStatus(i, {
                  status : MultisendBatchStatus.ERROR,
                  message : 'Gas limit exceeded - try reducing the batch size'
                }))
                return
              }
              // send the tokens with events
              method.send({ from: accounts[0], gas, gasPrice : state.account.gas_price})
                            
                // update on tx hash
                .on('transactionHash', hash => {
                  dispatch(updateBatchStatus(i, {
                    status : MultisendBatchStatus.SENT,
                    hash : hash
                  }))
                })

                // update on confirmation // ?? Do we need this ??
                // .on('confirmation', (confirmationNumber, receipt) => {
                //   console.log(confirmationNumber, receipt)
                // })

                // update on recepit
                .on('receipt', receipt => {
                  dispatch(updateBatchStatus(i, {
                    status : MultisendBatchStatus.CONFIRMED,
                    receipt : receipt
                  }))
                })

                // update on error
                .on('error', (error, receipt) => {
                  console.log(error)
                  dispatch(updateBatchStatus(i, {
                    status : MultisendBatchStatus.ERROR,
                    message : error.message
                  }))
                });
            }).catch(e => {
              dispatch(updateBatchStatus(i, {
                status : MultisendBatchStatus.ERROR,
                message : 'Gas estimation failed, this means that there is a problem with this transaction'
              }))
            })

						
					})
				})
			}).catch(e => {
				// the user denied the approval transaction for the airdrop token
				dispatch(approvalDenied())
			});

		} catch(e) {
			// the user denied the approval of the CAN fee
			dispatch(approvalDenied())
		}	
	}
}

export const approvalDenied = () => {
	return async dispatch => {
		dispatch(notificationAdd(
			'Whoops! Vital transactions were denied.',
			NotificationType.WARNING,
			5000
		))
		dispatch(setSummary({ status: MultisendSummaryStatus.INITIALIZED }))
		window.scrollTo(0, 0)
	}
}

// fetch current account data
export const fetchAccountData = (force) => {
	return (dispatch, getState) => {
		
		getWeb3().then( web3 => {

			web3.eth.getAccounts().then(async addresses => {
				let address = addresses[0];
				let state = getState()

				// only when address has changed, and the status is OK or INITIALIZED do we update
				if((address !== state.account.address && [AccountStatus.OK, AccountStatus.INITIALIZED].includes(state.account.status)) || force){

					// reset all values
					dispatch(accountUpdate({
						address : address,
						gas_limit : null,
						gas_price : null,
						balance_can : null,
						balance_wei : null,
						status : AccountStatus.FETCHING
					}))

					// init contract
					let contract = new web3.eth.Contract(Contracts.Token.abi, Contracts.Token.address.toLowerCase())
					
					// get new values
					let gas_limit = await contract.methods.transfer(address, 1).estimateGas().then( gas => (gas) )
					let gas_price = await web3.eth.getGasPrice().then( price => (price) )
					let balance_can = await contract.methods.balanceOf(address).call().then( balance => (balance) )
					let balance_wei = await web3.eth.getBalance(address).then( balance => (balance) )

					// update account
					dispatch(accountUpdate({
						address : address,
						gas_limit : gas_limit,
						gas_price : gas_price,
						balance_can : balance_can,
						balance_wei : balance_wei,
						status : AccountStatus.OK
					}))
				}
			}).catch( error => {
				console.log(error)
				dispatch(accountUpdate({status : AccountStatus.ERROR}))
			})
		})
	}
}

// init watchers etc
export const accountInit = () => {
	return (dispatch, getState) => {
		// if we're in initialized state then start polling/watching web3 for account changes 
		if(getState().account.status === AccountStatus.INITIALIZED){
			setInterval(function() {
				dispatch(fetchAccountData())
			}, 2000);
		}
	}
}

