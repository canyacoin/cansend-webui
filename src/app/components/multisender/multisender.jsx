import React, {Fragment} from 'react'
import { Route } from 'react-router-dom'
import { Breadcrumbs, Panel } from 'app.components'


// need to import these directly if we want to put them in a routes array to be imported elsewhere
// can't import via webpack aliases
import Upload from './multisender.upload.jsx'
import BuyCredit from './multisender.buycredit.jsx'
import Send from './multisender.send.jsx'

import './multisender.scss';

// define the routes/components available to the multisender
const routes = [
	{
		path : '/',
		components : <Upload/>,
		title : 'Upload'
	},
	{
		path : '/buy-credits',
		components : <BuyCredit/>,
		title : 'Buy Credits'
	},
	{
		path : '/send',
		components : <Send/>,
		title : 'Send'
	}
]

// export the routes as an array for 3rd party consumption
export const multisenderRoutes = routes.map(route => route.path)


const MultiSender = ({currentRoute}) => (
	<Fragment>
		<Breadcrumbs routes={routes} currentRoute={currentRoute}/>
		<Panel className={'multisender'}>
			{routes.map(route => <Route path={route.path} exact render={() => route.components} key={route.path}/>)}
		</Panel>
	</Fragment>
)

export default MultiSender