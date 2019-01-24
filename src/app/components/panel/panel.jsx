import React from 'react'
import './panel.scss';

const Panel = ({children, title, className, controls}) => 
	<section className={"component panel" + (className ? ' '+className : '')}>
		<header>
			{title && <h1 className={'title'}>{title}</h1>}
			{controls && <div className="controls">{controls}</div>}
		</header>
		<article className="content">
			{children}
		</article>
	</section>

export default Panel;