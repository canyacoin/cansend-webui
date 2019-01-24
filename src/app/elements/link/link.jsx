import React from 'react';
import { Link as RouterLink } from 'react-router-dom'
import './link.scss'

const Link = ({to, children, onClick, className}) => {
	return <RouterLink to={to} className={'element link' + (className ? ' ' + className : '')}>{children}</RouterLink>
}

export default Link