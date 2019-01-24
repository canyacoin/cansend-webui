import React from 'react';
import {Icon, IconType} from 'app.elements'
import './social.scss'

const socialLinks = [
	{
		url : 'http://facebook.com/CanYaCoin',
		icon : 'FACEBOOK'
	},
	{
		url : 'http://twitter.com/canyacoin',
		icon : 'TWITTER'
	},
	{
		url : 'http://instagram.com/canyacoin',
		icon : 'INSTAGRAM'
	},
	{
		url : 'http://youtube.com/canyacoin',
		icon : 'YOUTUBE'
	},
	{
		url : 'http://github.com/canyaio',
		icon : 'GITHUB'
	},
	{
		url : 'https://t.me/joinchat/GI97FhDD1lf6dh-r9XRdvA',
		icon : 'TELEGRAM'
	}
]

const Social = ({to, children, onClick}) => (
	<div className="element social">
		{socialLinks.map( link => <a href={link.url} target="_blank" key={link.icon}><Icon type={IconType.SOCIAL[link.icon]} /></a>)}
	</div>
)

export default Social