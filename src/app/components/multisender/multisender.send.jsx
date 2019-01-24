import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import CircularProgressbar from 'react-circular-progressbar';
import jump from 'jump.js'
import Units from 'ethereumjs-units'
import { Button, Icon, IconType, FormlessInput } from 'app.elements'
import { processTransactions, fetchAccountData, accountUpdate, summariseTransactions } from 'app/app.store.action'
import { MultisendBatchStatus, MultisendTokenStatus } from 'app/app.store.reducer'
import './multisender.send.scss';
import 'react-circular-progressbar/dist/styles.css';
import well_done from 'app.images/well_done.svg'

class RecipientList extends React.Component{
	
	constructor(props){
		super(props);

		this.state = {
			open : false,
		}
	}

	render(){
		return <div className="recipients" data-open={this.state.open}>
			
			<div className="items" data-has-hidden={this.props.recipients.length > 7 && !this.state.open}>
				{this.props.recipients.map( (recipient, i) => (
					<div key={i} className="recipient" data-status={recipient.tx.status} data-open={this.state.open || (!this.state.open && i < 7)}>
						<span>{recipient.recipient_address}</span>
						<span>{recipient.recipient_amount}</span>
					</div>
				))}
			</div>
			
			{this.props.recipients.length > 7 &&
				<div className="toggle"  onClick={ () => this.setState({ open : !this.state.open })}>
					<span>{this.state.open ? 'less' : 'more' }</span>
					<Icon type={IconType.CARET}/>
				</div>
			}
			
		</div>
	}
}

const PanelComplete = ({multisend}) => (
	<div className="complete">
		<h1>Well Done!</h1>
		<img src={well_done} alt="well done"/>
		<h5>You have sent {multisend.summary.token_count_int} Tokens to {multisend.summary.address_count} Addresses</h5>
		<p>Processing these transactions may take a couple of moments dependent on gas price</p>
		<p><Link to={'/history'}>View Transactions</Link></p>
		<Link to={'/'} className="element button">Start Again</Link>
	</div>
)

const PanelProgress = ({multisend}) => {

	let sent_confirmed_count = multisend.summary.batches.filter( batch => batch.status === MultisendBatchStatus.SENT || batch.status === MultisendBatchStatus.CONFIRMED).length
	
	let sent_pct = 100 / multisend.summary.batches.length * sent_confirmed_count
	let confirmed_pct = 100 / multisend.summary.batches.length * multisend.summary.batches.filter( batch => batch.status === MultisendBatchStatus.CONFIRMED).length

	return <div className="progress">
		<p>Please wait until you sign {multisend.summary.batches.length} transactions in metamask</p>
		
		<div className="circles">
			<CircularProgressbar 
				percentage={ sent_pct } 
				className={'progresscircle -send'} 
				strokeWidth={10} 
				styles={{
					path: { stroke: '#f0b42d' },
					trail: { stroke: '#f0fbff' },
					text : {fill: '#535353'}
				}}
				textForPercentage={(pct) => `${sent_confirmed_count}/${multisend.summary.batches.length} sent`}
			/>

			<CircularProgressbar 
				percentage={ confirmed_pct } 
				className={'progresscircle -confirmed'} 
				strokeWidth={10} 
				styles={{
					path: { stroke: '#4decca' },
					trail: { stroke: 'rgba(255,255,255,0)' },
					text : {fill: '#535353'}
				}}
				textForPercentage={(pct) => `${Math.round(confirmed_pct)}%`}
				
			/>
		</div>

		<p className="light">Listening to approvals on metamask...</p>
	</div>
}

const PanelOverview = ({multisend, account}) => {

	// TODO : account information should be part of summary
	
	let data = [
		{
			title : 'Total Tokens To Send',
			value : multisend.summary.token_count_int + ' ' + multisend.token_symbol
		},
		{
			title : 'Total Addresses',
			value : multisend.summary.address_count
		},
		{
			title : 'Total Fee',
			value : multisend.summary.can_fee + ' CAN'
		},
		{
			title : 'Your Token Balance',
			value : (multisend.token_balance ? (multisend.token_balance / Math.pow(10, multisend.token_decimal)).toFixed(2).replace(/\.00$/, '') : '')  + ' ' + multisend.token_symbol,
			processing : !multisend.token_balance
		},
		{
			title : 'Recommended Gas Price',
			value : (account.gas_price ? Units.convert(account.gas_price, 'wei', 'gwei') : '') + ' gwei',
			processing : !account.gas_price
		},
		{
			title : 'Number of Transactions',
			value : multisend.summary.batches.length + ' Transactions'
		},
		{
			title : 'Gas Cost (Approx.)',
			value : (account.gas_price_user
				? (Units.convert((account.gas_price_user * account.gas_limit), 'wei', 'eth') * multisend.summary.address_count).toFixed(4) + ' ETH'
				: (
						(
							account.gas_limit && account.gas_price
							? (Units.convert((account.gas_price * account.gas_limit), 'wei', 'eth') * multisend.summary.address_count).toFixed(4)
							: ''
						)
						+ ' ETH'
					)
				),
			processing : !account.balance_wei || !account.gas_price
		},
		{
			title : 'Your ETH Balance',
			value : Number((account.balance_wei ? Units.convert(account.balance_wei, 'wei', 'eth') : '')).toFixed(4) + ' ETH',
			processing : !account.balance_wei
		}
	]

	return <div className="overview">
		{data.map( (item, i) => {
			return <div key={i} data-processing={item.processing} >
				<h4>{item.title}</h4>
				<p>{item.value}</p>
			</div>
		})}
	</div>
}

const PanelSummary = ({multisend, startProcessing, account, dispatch}) => (
	<div className="summary">
		<p>You are sending {multisend.summary.token_count_int} {multisend.token_symbol} to {multisend.summary.address_count} Addresses which costs {multisend.summary.can_fee} CAN to process</p>
		<div className='transaction-info'>
			<div className="from">
				<h4>From Address</h4>
				<p>{multisend.summary.from_token_address}</p>
			</div>
			<div className="arrow"></div>
			<div className="to">
				<h4>To Addresses ({multisend.recipients.length})</h4>
				
				<RecipientList recipients={multisend.recipients}/>
				
				<div className="gas-price">
					<p>Override dafault gas price (gwei)</p>
					
					<FormlessInput 
						label='' 
						name='gas_price' 
						placeholder={account.gas_price ? Units.convert(account.gas_price, 'wei', 'gwei') : 'eg: 60'} 
						value={account.gas_price_user 
							? Units.convert(account.gas_price_user, 'wei', 'gwei') 
							: null
						} 
						allowempty={true} 
						onChange={ e => {
							// keep value within bounds
							let value = e.value.length > 4 ? parseInt(e.value.toString().substring(0, 4), 10) : e.value;

							// is there a value?
							!e.value || e.value === ''
								? dispatch(accountUpdate({gas_price_user : null}))
								: dispatch(accountUpdate({gas_price_user : Units.convert(value, 'gwei', 'wei')}))
						}}
						selfmanaged={false}
						attrs={{
							type : 'number',
							min : 5,
							max : 6000,
							maxLength : 4
						}}
					/>

					{account.gas_price_user && <Icon type={IconType.CLOSE} className={'reset'} onClick={ e => dispatch(accountUpdate({gas_price_user : null})) }/>}

				</div>
			</div>
		</div>
		<div className="controls">
			<Button to="/send#processing" onClick={ e => startProcessing() }>Send</Button>
		</div>
	</div>
)

class Send extends React.Component{
	
	componentDidMount(){
			
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

		// update the account data when reaching this page - just in case it has changed since last fetch
		this.props.dispatch(fetchAccountData(true))
		// fetch the current token details
		// this.props.dispatch(fetchTokenMeta(this.props.multisend.token_address))
		// sumarize TXs
		this.props.dispatch(summariseTransactions(this.props.multisend.recipients))
	}

	componentWillReceiveProps(nextProps){
		if(nextProps === this.props) return;
		
		this.setState({
			status : nextProps.multisend.summary.status
		})
	}

	render(){
		return <div className="multisender -send" data-status={this.props.multisend.summary.status}>
			<PanelComplete {...this.props}/>
			<PanelProgress {...this.props}/>
			<PanelOverview {...this.props}/>
			<PanelSummary {...this.props} startProcessing={()=>{this.startProcessing()}}/>
		</div>
	}

	startProcessing(){
		jump('.multisender.-send', {offset : -40})
		//this.setState({status : SendingStatus.PROCESSING}, ()=>{
		this.props.dispatch(processTransactions())
		//})
	}
}

const mapStateToProps = (state) => {
	return {
		multisend : state.multisend,
		account : state.account
	}
}

export default connect(mapStateToProps)(withRouter(Send));