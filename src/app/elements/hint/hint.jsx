import React from 'react'
import './hint.scss';

const Hint = ({text, children, handleClick}) => {

	return 	<span className="element hint" onClick={ e => (handleClick && handleClick(e)) }>
				<span className="popup">{text}</span>
				{children}
			</span>
}

export default Hint;