import React from 'react';
//import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import './breadcrumbs.scss';

const BreadcrumbItem = ({path, title, index, active}) => {
	return active
		? <Link className="item" to={path} data-title={title} data-active={active}><strong>{index}</strong></Link>
		: <Link className="item" to={'#'} data-title={title} data-active={active}><strong>{index}</strong></Link>
}

const Breadcrumbs = ({routes, currentRoute}) => {
	let active = true;
	let progress = 0;
	
	let items = routes.map( (route, i) => {
		let item = <BreadcrumbItem {...route} active={active} index={i+1} key={i}/>
		if (route.path === currentRoute) {
			active = false;
			progress = i;
		}
		return item;
	})

	return 	<div className="component breadcrumbs" data-progress={((progress / (routes.length-1)) * 100) + '%'}>
				<span className="progress"><span style={{width : `${((progress / (routes.length-1)) * 100)}%`}}/></span>
				{items}
			</div>
}

export default Breadcrumbs;