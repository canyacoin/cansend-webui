import React from 'react'
import {Panel} from 'app.components'
import './faqs.scss';

const faqItems = [
	{
		q : 'How do I use this tool?',
		a : 'Provide the token contract address and CSV of required transactions. This tool will create Metamask transactions in batches of 200.'
	},
	{
		q : 'How much does it cost?',
		a : 'It costs 1 CAN to send to 10 Addresses '
	},
	{
		q : 'How do I use this tool?',
		a : 'Provide the token contract address and CSV of required transactions. This tool will create Metamask transactions in batches of 200.'
	}
]

const Faqs = () => 
	<Panel className="component faqs" title="FAQs">
		{faqItems.map( item => <div className="faq"><h3 className="question">{item.q}</h3><p className="answer">{item.a}</p></div>)}
		<p className={'disclaimer'}>Please submit feedback and questions to see more FAQ's here.</p>
	</Panel>

export default Faqs;