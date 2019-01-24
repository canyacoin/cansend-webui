import React from 'react'
import {Icon, IconType} from 'app.elements'
import './overlay.scss';

const Overlay = ({children, visible, closeable, onClose}) => (
	<span className="element overlay" data-visible={visible}>
		{closeable && <Icon type={IconType.CLOSE} className='overlay-close' onClick={() => onClose()} />}
		<span className="inner">{children}</span>
	</span>
)

export default Overlay;