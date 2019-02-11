import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import config from 'app.config'
import { Formless, FormlessRow, FormlessColumn, FormlessInput, FormlessRepeater, FormlessSubmit, NotificationType, DialogButtonTypes, Icon, IconType, /*Overlay*/ } from 'app.elements'
import { DragDrop } from 'app.components'
import { notificationAdd, transactionRecipientsAdd, transactionFieldsAdd, dragDrop, fetchTokenMeta, openDialog } from 'app/app.store.action'
import { Contracts } from 'app.contract'
import { MultisendRecipientStatus, MultisendTokenStatus } from 'app/app.store.reducer'
//import { CanSendContract } from 'app.contract'
import pluralize from 'pluralize';
import './multisender.upload.scss';

class TokenForm extends React.Component{

	constructor () {
		super()
		this.state = {
			gotAcc: false
		}
	}

	componentDidMount(){
		this.props.dispatch(dragDrop(false))
		//this.props.dispatch(fetchTokenMeta(this.props.multisend.token_address, this.props.account.address))
		if(!this.props.multisend.summary.from_token_address) this.props.dispatch(fetchTokenMeta(Contracts.Token.address, this.props.account.address))
	}

	componentWillReceiveProps() {
		if (this.props.account.address && !this.state.gotAcc) {
			this.props.dispatch(fetchTokenMeta(Contracts.Token.address, this.props.account.address))
			this.setState({ gotAcc: true })
		}
	}

	render(){
		//console.log(this.props.multisend.token_balance)
		const multisendData = this.props.multisend
		const recipients = multisendData.recipients
		let sublabel = null
		if (recipients && recipients.length) {
			let total_can = recipients.reduce((acc, recipient) => {
				return acc + (isNaN(Number(recipient.recipient_amount)) ? 0 : parseInt(Number(recipient.recipient_amount), 10))
			}, 0)
			sublabel = ` (${recipients.length} recipients, ${isNaN(total_can) ? 0 : total_can} Tokens)`
		}


		return 	<div className="multisender -upload">

					<DragDrop handleUpload={data => this.handleDragDrop(data)} handleRejection={items => this.handleDragDropRejected(items)} onMouseOut={ e => this.props.dispatch(dragDrop(false))}/>

					<Formless 
						onSubmit={fields => this.handleSubmit(fields)} 
						onError={ e => this.props.dispatch(notificationAdd(`<strong>Warning!</strong> the following fields need attention: <strong>${e.join(', ')}</strong>`, NotificationType.WARNING, 8000, 'multisender_field_warning'))}
					>
						<FormlessRow>
							<FormlessColumn width={80}>
								<FormlessInput 
									label='Token Address' 
									name='token_address' 
									placeholder="0xad5d6a6f43eeabaf9f57a02ae68a317f39aa0412" 
									value={multisendData.token_address} 
									allowempty={false} 
									selfmanaged={false} 
									validate='ethaddress'
									prefix={multisendData.token_status === MultisendTokenStatus.SUCCESS 
										? <Icon type={IconType.TICK}/> 
										: (multisendData.token_status === MultisendTokenStatus.FETCHING 
											? <Icon type={IconType.SPINNER}/> 
											: (multisendData.token_status === MultisendTokenStatus.ERROR ? <Icon type={IconType.EXCLAMATION}/> : '')	
										)
									}
									suffix={multisendData.token_status === MultisendTokenStatus.SUCCESS 
										? multisendData.token_symbol
										: ''
									}
									onChange={(e) => {
										this.props.dispatch(fetchTokenMeta(e.value, this.props.account.address))
									}
								}/>
							</FormlessColumn>
							<FormlessColumn width={20}>
								<FormlessInput 
									noedit={true} 
									label='Token Decimal' 
									name='token_decimal' 
									value={multisendData.token_decimal} 
									allowempty={false} 
									selfmanaged={false} 
									validate="integer" 
									suffix={multisendData.token_status === MultisendTokenStatus.FETCHING 
										? <Icon type={IconType.SPINNER}/> 
										: (multisendData.token_status === MultisendTokenStatus.ERROR 
											? <Icon type={IconType.EXCLAMATION}/>
											: null
										)
									} 
								/>
							</FormlessColumn>
						</FormlessRow>

						<FormlessRow>
							<FormlessColumn>
								<FormlessRepeater 
									label={'Recipient Addresses'}
									sublabel={sublabel}
									name='recipient' 
									value={recipients} 
									addText='+ Add Another' 
									onClear={ () => this.props.dispatch(transactionRecipientsAdd([])) } 
									onChange={ newRecipients => this.props.dispatch(transactionRecipientsAdd(newRecipients)) }
									onPrompt={ prompt => this.props.dispatch(openDialog(prompt.text, {
										cancelButton : true,
										buttons : [{
											text : 'Clear All',
											type : DialogButtonTypes.WARNING,
											callback : prompt.accept
										}]
									}))}>
									<FormlessInput width="80" label='Recipient Address' name='address' placeholder="0x8a85470d9C5EA55101eE98632e84C0AdED57cB2b" allowempty={false} validate='ethaddress'/>
									<FormlessInput width="20" label='Amount to Send' name='amount' placeholder="12" allowempty={false} validate="integer"/>
								</FormlessRepeater>
							</FormlessColumn>
						</FormlessRow>

						<FormlessRow className={'controls'}>
							<span className="contract-link">CanSend Address: <a target="_blank" href={'https://' + (config.network === 42 ? 'kovan.' : '') + 'etherscan.io/address/' + Contracts.Multisender.address}>{Contracts.Multisender.address}</a><br/>25 CAN per {config.address_per_can} Addresses</span>
							<FormlessSubmit label='Next'/>
						</FormlessRow>
					</Formless>
				</div>
	}

	handleDragDrop(data){
		// build recipient array
		let recipients = data.split(/\r|\n/).map(line => {
			let splitline = line.split(/,/);
			return {
				recipient_address : splitline[0],
				recipient_amount : parseInt(splitline[1], 10),
				tx : {
					status : MultisendRecipientStatus.PENDING
				}
			}
		})

		recipients = recipients.filter(r => r.recipient_address !== '')

		this.props.dispatch(transactionRecipientsAdd(recipients))
		this.forceUpdate()
			
		// notification
		let total_can = recipients.reduce( (acc, recipient) => {return acc + parseInt(recipient.recipient_amount, 10)}, 0 )
		this.props.dispatch(notificationAdd(`<strong>Success!</strong> Uploaded <strong>${recipients.length}</strong> ${pluralize('recipient', recipients.length)} with a combined total of <strong>${total_can}</strong> ${pluralize('token', total_can)}`, NotificationType.NOTIFICATION, 3000))
	}

	handleDragDropRejected(items){
		this.props.dispatch(notificationAdd(`Some files could not be processed: \n\n ${items.join(' ,')}`, NotificationType.WARNING, 3000))
	}

	handleSubmit(fields){
		// add all transactions
		this.props.dispatch(transactionFieldsAdd({
			token_address : fields.token_address,
			token_decimal : fields.token_decimal,
			recipients : fields.recipient.map( recipient => ({
				...recipient, 
				recipient_amount : parseInt(recipient.recipient_amount, 10), 
				tx : {
					status : MultisendRecipientStatus.PENDING
				} 
			}))
		}));
		
		// add notification
		let total_can = fields.recipient.reduce( (acc, recipient) => {return acc + parseInt(recipient.recipient_amount, 10)}, 0 )
		this.props.dispatch(notificationAdd(`You will be sending <strong>${total_can}</strong> ${pluralize('Token', total_can)} to <strong>${fields.recipient.length}</strong> ${pluralize('address', fields.recipient.length)}`, NotificationType.NOTIFICATION, 8000))
		
		//this.props.dispatch(progressMultisender(this.props.history))
		// new page
		this.props.history.push('/buy-credits')
	}
}

// redux mapping
const mapStateToProps = (state) => ({ 
	multisend: state.multisend,
	account: state.account
})

export default connect(mapStateToProps)(withRouter(TokenForm))