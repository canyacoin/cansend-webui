import { NotificationType } from 'app.elements'

export const AccountStatus = {
	INITIALIZED : 'initialized',
	FETCHING : 'fetching',
	OK : 'ok',
	ERROR : 'error'
};

export const MultisendRecipientStatus = {
	PENDING : 'pending',
	PROCESSING : 'processing',
	SUCCESS : 'success',
	CONFIRMED : 'confirmed',
	FAILED : 'failed'
};

export const HistoryStatus = {
	INITIALIZED : 'initialized',
	FETCHING : 'fetching',
	SUCCESS : 'success',
	EMPTY : 'empty',
	FAILURE : 'failure'
};

export const MultisendSummaryStatus = {
	INITIALIZED : 'initialized',
	PROCESSING_APPROVALS : 'processing-approvals',
	PROCESSING : 'processing',
	COMPLETE : 'complete',
	ERROR : 'error'
};

export const MultisendApprovalStatus = {
	PENDING : 'pending',
	SENT : 'sent',
	CONFIRMED : 'confirmed',
	ERROR : 'failed'
};

export const MultisendBatchStatus = {
	PENDING : 'pending',
	SENT : 'sent',
	CONFIRMED : 'confirmed',
	ERROR : 'failed'
};

export const MultisendTokenStatus = {
	INITIALIZED : 'initialized',
	FETCHING : 'fetching',
	SUCCESS : 'success',
	EMPTY : 'empty',
	ERROR : 'failure'
};

// initial state - TODO move default values
export const initialState = {
	multisend : {
		// token data
		//token_address : '0xad5d6a6f43eeabaf9f57a02ae68a317f39aa0412',
		token_address : null,
		token_decimal : null,
		token_status : MultisendTokenStatus.INITIALIZED,
		token_symbol : null,
		token_balance : null,

		
		// recipients
		recipients : Array.from(Array(1).keys()).map( a => ({
			// recipient_address : '0x8a85470d9C5EA55101eE98632e84C0AdED57cB2b', 
			// recipient_amount : Math.floor(Math.random() * 50) + 1,
			recipient_address : '', 
			recipient_amount : null,
			tx : {
				status : MultisendRecipientStatus.PENDING
			}
		})),

		// TX summary data
		summary : {
			from_token_address : null,
			from_token_decimal : null,
			can_fee : null,
			address_count : null,
			token_count_int : null,
			token_count_bn : null,
			batches : [],
			status : MultisendSummaryStatus.INITIALIZED,
		},

		step : 1
	},
	notifications : [
		{id : 1234, text : '<strong>CanSend</strong> lets you send tokens to multiple addresses at once!', type : NotificationType.SUCCESS, duration : 5000}
	],
	dragdrop : false,
	dialog : null,
	account : {
		address : null,
		gas_limit : null,
		gas_price : null,
		gas_price_user : null,
		balance_can : null,
		balance_eth : null,
		status : AccountStatus.INITIALIZED,
		contract : {},
	},
	txhistory : {
		address : null,
		blocks : 0,
		status : HistoryStatus.INITIALIZED,
		items : []
	},
	tokens : {},
	network : {
		id : null,
		name : null
	}
}


const appReducer = (state, action) => {
	switch (action.type) {
		case "APP.NOTIFICATION.ADD":
			return {
				...state,
				notifications : [
					...state.notifications,
					action.item
				]
			};
		case "APP.NOTIFICATION.REMOVE":
			return {
				...state,
				notifications : state.notifications.filter( n => n.id !== action.id )
			};
		case "APP.DRAGDROP.VISIBLE":
			return {
				...state,
				dragdrop : action.visible
			};
		case "APP.TRANSACTION.RECIPIENTS.ADD":
			return {
				...state,
				multisend : {
					...state.multisend,
					recipients : action.recipients
				}
			};
		case "APP.TRANSACTION.FIELDS.ADD":
			return {
				...state,
				multisend : {
					...state.multisend,
					...action.fields
				}
			};
		case "APP.TRANSACTION.STATUS.UPDATE":
			let recipients = state.multisend.recipients;
			recipients[action.index].tx.status = action.status

			return {
				...state,
				multisend : {
					...state.multisend,
					recipients : recipients
				}
			}
		case "APP.DIALOG.OPEN":
			return {
				...state,
				dialog : {
					text : action.text,
					options : action.options
				}
			}
		case "APP.DIALOG.CLOSE":
			return {
				...state,
				dialog : null
			}
		case "APP.ACCOUNT.UPDATE":
			return {
				...state,
				account : {
					...state.account,
					...action.account
				}
			}
		case "APP.TRANSACTION.SUMMARY.UPDATE":
			return {
				...state,
				multisend : {
					...state.multisend,
					summary : {
						...state.multisend.summary,
						...action.summary
					}
				}
			}
		case "APP.TRANSACTION.BATCH.UPDATE":

			// itterate batches and append new data
			let batches = state.multisend.summary.batches.map( (batch, i) => {
				if(i === action.index) return { ...batch, ...action.data }
				return batch
			})

			// check all batch statuses
			let status = MultisendSummaryStatus.INITIALIZED
			let statuses = batches.map( batch => batch.status ).filter( (elem, pos, arr) => { return arr.indexOf(elem) === pos } );
				
			// all batches have the same status : we're in a single, uniform state
			if(statuses.length === 1){
				status = statuses[0] === MultisendBatchStatus.CONFIRMED
					? MultisendSummaryStatus.COMPLETE
					: MultisendSummaryStatus.PROCESSING
			}
			// batches have differing statuses : we're processing
			else{
				status = MultisendSummaryStatus.PROCESSING
			}

			return {
				...state,
				multisend : {
					...state.multisend,
					recipients : status === MultisendSummaryStatus.COMPLETE ? initialState.multisend.recipients : state.multisend.recipients,
					summary : {
						...state.multisend.summary,
						status : status,
						batches : batches
					}
				}
			}
		case "APP.TRANSACTION.APPROVAL.UPDATE":

			// iterate approvals and append new data
			let approvals = state.multisend.summary.approvals.map( (approval, i) => {
				if(i === action.index) return { ...approval, ...action.data }
				return approval
			})

			// check all approval statuses
			let status = MultisendSummaryStatus.INITIALIZED
			let statuses = approvals.map( approval => approval.status ).filter( (elem, pos, arr) => { return arr.indexOf(elem) === pos } );

			return {
				...state,
				multisend : {
					...state.multisend,
					recipients : status === MultisendSummaryStatus.COMPLETE ? initialState.multisend.recipients : state.multisend.recipients,
					summary : {
						...state.multisend.summary,
						status : status,
						approvals : approvals
					}
				}
			}
		case "APP.HISTORY.UPDATE":
			return {
				...state,
				txhistory : {
					...state.txhistory,
					...action.data
				}
			}
		case "APP.HISTORY.ITEM.UPDATE":
			return {
				...state,
				txhistory : {
					...state.txhistory,
					items : state.txhistory.items.map( tx => {
						if(tx.hash === action.hash) {
							return {
								...tx,
								...action.data
							}
						}
						return tx
					})
				}
			}
		case "APP.TOKEN.UPDATE":
			
			let tokens = state.tokens;
			tokens[action.key] = action.value

			return {
				...state,
				tokens : {
					...tokens
				}
			}
		
		case "APP.MULTISEND.UPDATE":
			return {
				...state,
				multisend: {
					...state.multisend,
					...action.data
				}
			}
		
		case "APP.MULTISEND.TOKEN.UPDATE":
			return {
				...state,
				multisend: {
					...state.multisend,
					token : {
						...state.multisend,
						...action.data
					}
				}
			}
		default:
			return state
	}
}

export default appReducer;