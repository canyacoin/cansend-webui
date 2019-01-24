import React from 'react';
import { Link } from 'react-router-dom'
import './button.scss'

const Button = ({to, children, onClick, disabled, className}) => {
  if (disabled) return <a className="element button disabled">{children}</a>
	return <Link to={to} className={'element button' + (className ? ' ' + className : '')} onClick={e => onClick(e)} >{children}</Link>
}

export default Button