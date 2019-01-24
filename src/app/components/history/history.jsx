import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { fetchRecentTransactions } from 'app/app.store.action'
import {Panel} from 'app.components'
import { Icon, IconType, Table, TableHeader, TableBody, TableRow, FormlessSelect } from 'app.elements'
import config from 'app.config'
import './history.scss';
import 'react-table/react-table.css'




class History extends React.Component{

	constructor(props){
		super(props)

		this.blockSelectorOptions = [
			{value : 240, label : 'Past Hour'},
			{value : 5760, label : 'Past Day'},
			{value : 40320, label : 'Past Week'},
			{value : 175200, label : 'Past Month'}
		]

		this.state = {
			blocks : this.blockSelectorOptions[1].value,
			mytxs: null
		}
	}

	async componentDidMount(){
		this.props.dispatch(fetchRecentTransactions(this.state.blocks, true))
		const txs = await this.fetchAllTxs()
		this.setState({ alltxs: txs })
	}

	async componentWillReceiveProps(nextProps){
		const txs = await this.fetchAllTxs()
		this.setState({ alltxs: txs })
	}

	printTableRows (txs) {
		if (!txs) return
		return txs.map((tx, i) => {
			return <TableRow key={i} data={[
				<Icon type={tx.status === true ? IconType.TICK : IconType.SYNC}/>, 
				<a href={`https://${config.network === 42 ? 'kovan.' : ''}etherscan.io/block/` + tx.block} target='_blank'>{tx.block}</a>,  
				tx.amount, 
				Number.isInteger(this.props.tokens[tx.token]) ? <Icon type={IconType.SPINNER}/> : this.props.tokens[tx.token], 
				tx.recipient_count === -1 ? <Icon type={IconType.SPINNER}/> : tx.recipient_count, 
				<a href={`https://${config.network === 42 ? 'kovan.' : ''}etherscan.io/tx/` + tx.hash} target='_blank'>0x{this.truncateHash(tx.hash)}</a>
			]}/> 
		})
	}

	async fetchAllTxs () {
		const items = await Promise.all(this.props.txhistory.items)
		return items
	}

	fetchMyTxs(items){
		if (!items) return
		return items.filter(tx => {
			let mine = false;

			// check if TXs belong to current web3 account
			if(this.props.account.address && tx.logs.length > 0){
				let topics = tx.logs.map( log => {
					return log.topics[1];
				})
				mine = JSON.stringify(topics).toLowerCase().includes(this.props.account.address.substring(2).toLowerCase()) ? true : false
			}

			return mine;
		})
	}

	render(){

		//console.log(this.state.alltxs)

		const mytxs = this.fetchMyTxs(this.state.alltxs)

		if (!this.state.alltxs) return <div />

		return 	<div className="component history">

					<Panel 
						title={'My Transactions'} 
						controls={[
							<FormlessSelect key={1} name='blocks' default={this.state.blocks} options={this.blockSelectorOptions} onChange={ e => this.props.dispatch(fetchRecentTransactions(e.value)) }/>
						]}>

						<Table state={this.props.txhistory.status === 'success' && mytxs.length <= 0 ? 'empty' : this.props.txhistory.status}>
							<TableHeader columns={['Status', 'Block #', 'Amount', 'Token', '# Recipients', 'TxHash']}/>
							<TableBody>
								{this.printTableRows(mytxs)}
							</TableBody>
						</Table>
					</Panel>
					
					<Panel title={'Everyone’s Recent Transactions'} >
						<Table state={this.props.txhistory.status}>
							<TableHeader columns={['Status', 'Block #', 'Amount', 'Token', '# Recipients', 'TxHash']}/>
							<TableBody>
								{this.printTableRows(this.state.alltxs)}
							</TableBody>
						</Table>
					</Panel>
				</div>
	}

	parseAddress(addr){
		if(!addr) return null;
		return addr.slice(-40);
	}

	truncateHash(addr){
		if(!addr) return null;
		return addr.substring(0, 10) + '...' + addr.substring(addr.length-4, addr.length)
	}
}

const mapStateToProps = (state) => {
	return {
		account: state.account,
		txhistory : state.txhistory,
		tokens : state.tokens
	}
}


export default connect(mapStateToProps)(withRouter(History));