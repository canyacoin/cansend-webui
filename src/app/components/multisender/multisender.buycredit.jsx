import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import Units from 'ethereumjs-units'
import config from 'app.config';
import { Button, FormlessSelect, Overlay, NotificationType, Icon, IconType } from 'app.elements'
import { notificationAdd, fetchAccountData } from 'app/app.store.action'
import { MultisendTokenStatus } from 'app/app.store.reducer'
import { getWeb3 } from 'app.contract'
import './multisender.buycredit.scss';
import eth_logo from 'app.images/eth_logo.svg'
import can_logo from 'app.images/can_logo.svg'
import arrow from 'app.images/arrow.svg'

class BuyCredit extends React.Component{
	
	constructor(props){
		super(props);

		this.canAmountOptions = [
			{value : 1, label : '1 CAN'},
			{value : 5, label : '5 CAN'},
			{value : 10, label : '10 CAN'},
			{value : 15, label : '15 CAN'},
		]

		this.state = {
			ethPrice : null,
			canBalance : this.props.account.balance_can,
			canSelected : 5,
			waiting: false,
			bancorTxHash: null
		}
	}

	componentDidMount() {
		// make sure we have the correct fields
		let data = this.props.multisend;
		if(
			data.recipients.length <= 0 || 
			!data.token_address ||
			!data.token_balance || 
			!data.token_decimal || 
			data.token_status !== MultisendTokenStatus.SUCCESS || 
			!data.token_symbol
		){
			this.props.history.push('/'); 
			return;
		}
		
		this.props.dispatch(fetchAccountData(true))
		
		fetch('https://api.bancor.network/0.1/currencies/5a6f61ece3de16000123763a/ticker?fromCurrencyId=5937d635231e97001f744267', {
			headers: { 'Content-Type': 'application/json' },
			method: 'GET',
			mode: 'cors'
		}).then((data)=>{
			return data.json()
		}).then(res => {
			this.setState({ethPrice : res.data.price})
		}).catch( e => {
			this.setState({ethPrice : -1})
			this.props.dispatch(notificationAdd(`<strong>Error!</strong> There was a problem fetching the CAN conversion rate: ${e.message}`, NotificationType.WARNING, 8000))
		})

		// TODO : BANCOR API NOT WORKING!! Setting manually - remove later
		//this.setState({ethPrice : 0.00023606})
	}

	async getConversionTransactionData (canAmount, userAddress) {
		
		if(!this.state.ethPrice) {
			throw new Error('CAN/ETH conversion rate has not yet been calculated.')
		}

		const canToBuy = Number(canAmount) + 0.5
		const ethNecessaryToBuyCan = this.state.ethPrice * canToBuy
		const weiNecessary = Units.convert(ethNecessaryToBuyCan, 'eth', 'wei')
		const response = await fetch('https://api.bancor.network/0.1/currencies/convert', {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({
				'blockchainType': 'ethereum',
			  'amount': weiNecessary,
			  'minimumReturn': canToBuy,
			  'ownerAddress': userAddress,
			  'fromCurrencyId': '5937d635231e97001f744267',
			  'toCurrencyId': '5a6f61ece3de16000123763a'
			}),
			mode: 'cors'
		})
		.then(res => res.json())
		.catch( e => {
			throw new Error(e.message)
		})

		if(response.errorCode){
			switch (response.errorCode) {
				case 'insufficientEtherForGas':
					throw new Error(`Ensufficient ETH for gas.`)
				case 'invalidAmount':
					throw new Error(`ETH price was not defined.`)
				default:
					throw new Error(`Error requesting conversion rate (${response.errorCode})`)
			}
		}else{
			return response.data[0]
		}
	}

	async sendTransaction (txData) {
		const web3 = await getWeb3()
		return new Promise((resolve, reject) => {
			web3.eth.sendTransaction(txData, (e, txHash) => {
				if (e) return reject(e)
				resolve(txHash)
			})
		})
	}

	async onTransactionMined (txHash, _callback) {
		const web3 = await getWeb3()
		const receipt = await web3.eth.getTransactionReceiptMined(txHash)
		_callback(receipt)
	}

	render () {
		let min_credit = Math.floor(this.props.multisend.recipients.length / config.address_per_can) * 25;
		const enoughCredit = (this.props.account.balance_can / Math.pow(10, 6)) < min_credit
		return enoughCredit
			? this.render_notEnoughCredit(min_credit)
			: this.render_enoughCredit(min_credit)
	}

	render_notEnoughCredit(min_credit){

		const allowNext = false

		return <div className="multisender -buycredit">
			<Overlay visible={this.state.waiting}>
				{
					!this.state.bancorTxHash &&
					[
						<h1 key={1}>Generating Transaction...</h1>,
						<Icon key={2} type={IconType.SPINNER}/> 
					]
				}
				{
					this.state.bancorTxHash &&
					<div>
						<h2>Nice, transaction submitted</h2>
						<a target="_blank" href={'https://etherscan.io/tx/' + this.state.bancorTxHash}>
							{this.state.bancorTxHash}
						</a>
						<p>This overlay will close automatically when the transaction is complete</p>
					</div>
				}
			</Overlay>
			
			{this.renderCanRequired(min_credit)}
			
			<span className="logos">
				<img src={eth_logo} className="logo" alt="ETH"/>
				<img src={arrow} className="arrow" alt=""/>
				<img src={can_logo} className="logo" alt="CAN"/>
			</span>

			<FormlessSelect label='' name='can_amount' default={this.state.canSelected} options={this.canAmountOptions} onChange={e => this.setState({canSelected : e.value})}/>

			<p className="can-calculation">With this amount of CAN you can send to {this.state.canSelected * config.address_per_can} addresses</p>

			<div className="can-purchase-button">
				<Button to="#" onClick={async () => {
					this.setState({ waiting: true })
					let txHash
					try {
						const txData = await this.getConversionTransactionData(this.state.canSelected, this.props.account.address)
						txHash = await this.sendTransaction(txData)
					} catch (e) {
						this.props.dispatch(notificationAdd(`<strong>Error!</strong> ${e.message}`, NotificationType.WARNING, 8000))
						this.setState({ waiting: false })
						return
					}
					this.setState({ bancorTxHash: txHash })
					this.onTransactionMined(txHash, (receipt) => {
						this.setState({ waiting: false })
						this.props.dispatch(fetchAccountData(true))
					})
				}}>Purchase</Button>
			</div>
			{this.renderControls(allowNext)}
		</div>
	}

	render_enoughCredit(min_credit){
		let token_balance = parseInt(this.props.multisend.token_balance, 10);
		let token_count = this.props.multisend.summary.token_count_bn 
			? this.props.multisend.summary.token_count_bn.toNumber()
			: -1

		const allowNext = token_balance >= token_count ? true : false
		
		return <div className="multisender -buycredit">
			{this.renderCanRequired(min_credit)}
			{!allowNext && 
				<p className="error">
					<Icon type={IconType.EXCLAMATION}/> 
					<strong>You don't have enough {this.props.multisend.token_symbol} in your account to complete this multisend.</strong><br/>
					Please add more {this.props.multisend.token_symbol} or reduce the number of tokens you're sending.
				</p>
			}
			{this.renderControls(allowNext)}
		</div>
	}

	renderControls (allowNext = false) {
		return <div className="controls">
				<Button to="/" onClick={ e => this.props.history.push('/') }>Add more addresses</Button>
				<Button to="/send" onClick={ e => this.props.history.push('/send') } disabled={!allowNext}>Next</Button>
			</div>
	}

	renderCanRequired (min_credit) {
		return <div>
				<p>These transactions need {min_credit} CAN to process</p>
				<p className="can-balance">
					{'You currently hold: '}
					{!this.props.account.balance_can
						? <Icon type={IconType.SPINNER}/> 
						: Number(Units.convert(this.props.account.balance_can, 'szabo', 'eth')).toLocaleString()
					}
					{' CAN'}
				</p>
				<p className="eth-conversion">
					{!this.state.ethPrice || this.state.ethPrice === -1
						? (this.state.ethPrice === -1 ? '[error]' : <Icon type={IconType.SPINNER}/>)
						: Number(this.state.ethPrice).toFixed(8) + ' ETH' 
					} 
					{' '} = 1 CAN 
				</p>
			</div>
	}
}

const mapStateToProps = (state) => {
	return {
		multisend: state.multisend,
		account: state.account
	}
}

export default connect(mapStateToProps)(withRouter(BuyCredit));