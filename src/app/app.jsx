import React from 'react'
import { connect } from 'react-redux'
import { Route } from 'react-router-dom'
import { Header, Footer, MultiSender, multisenderRoutes, History, Faqs, Terms} from 'app.components'
import { Notification, Overlay, Dialog } from 'app.elements'
import { accountInit, dragDrop } from 'app/app.store.action'
import metamask_fox from 'app.images/metamask_fox.svg'
import './app.scss';

const App = ({account, dialog, location, dispatch}) => {
	
	dispatch(accountInit())

	return <div onDragEnter={()=>dispatch(dragDrop(true))}>

		{dialog && <Dialog {...dialog}/>}
		
		<Overlay visible={account.status === 'fetching'}>
			<img src={metamask_fox} alt="metamask"/>
			<p>Metamask syncing</p>
		</Overlay>

		<Header/>
		<main>
			<Notification/>
			<Route path={multisenderRoutes} exact render={() => <MultiSender currentRoute={location.pathname}/> }/>
			<Route path='/faqs' exact render={() => <Faqs/>}/>
			<Route path='/terms-and-conditions' exact render={() => <Terms/>}/>
			<Route path='/history' exact render={() => <History/>}/>
		</main>
		<Footer/>
	</div>
}

const mapStateTpProps = (state) => ({
	account : state.account,
	dialog : state.dialog
})

export default connect(mapStateTpProps)(App);
