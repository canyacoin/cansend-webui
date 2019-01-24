import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { closeDialog } from 'app/app.store.action'
import { Icon, IconType } from 'app.elements'
import './dialog.scss'

// dialog types
export const DialogButtonTypes = {
	WARNING : 'warning',
	NOTIFICATION : 'notification',
	SUCCESS : 'success'
}

class Dialog extends React.Component{
	constructor(props){
		super(props)

		this.state = {
			open : false
		}

		this.animationTime = 250
	}
	
	componentDidMount(){
		setTimeout( () => this.setState({open : true}), 1)
	}

	render(){
		return <div className="element dialog" data-open={this.state.open} style={{transitionSpeed : this.animationTime + 'ms'}}>
			<div className="panel">

				<div className="header">
					<h4 className={'title'}>{this.props.text}</h4>
					<Icon type={IconType.CLOSE} className={'failed'} onClick={ e => this.close() }/>
				</div>
				

				<div className="buttons">
					{this.props.options.buttons.map( (button, i) => <button key={i} data-type={button.type} onClick={ e => this.handleCallback(button) }>{button.text}</button> )}
					{this.props.options.cancelButton && <button data-type={'cancel'} onClick={ e => this.close()}>Cancel</button>}
				</div>
			</div>
		</div>
	}

	handleCallback(button){
		if(button.callback) button.callback()
		this.close()
	}

	close(){
		this.setState({open : false}, ()=>{
			setTimeout(()=>{
				this.props.dispatch(closeDialog())
			}, this.animationTime)
		})
	}
}

// // dialog container
// const Dialog = ({text, buttons}) => {
// 	return 	<div className="element dialog">
// 				{text}
// 			</div>
// }

// dialog proptypes
Dialog.propTypes = {
	dialog : PropTypes.shape({
		text: PropTypes.string,
		buttons: PropTypes.array
	}),
}

// redux mapping
const mapStateToProps = (state) => {
	return {
		text: state.dialog ? state.dialog.text : '',
		buttons : state.dialog ? state.dialog.buttons : '',
	}
}

export default connect(mapStateToProps)(Dialog)