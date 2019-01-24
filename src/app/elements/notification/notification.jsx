import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { notificationRemove } from 'app/app.store.action'
import {Icon, IconType} from 'app.elements'
import './notification.scss'

// notification types
export const NotificationType = {
	WARNING : 'warning',
	NOTIFICATION : 'notification',
	SUCCESS : 'success'
}

class NotificationItem extends React.Component{
	
	state = { open: false }
	transitionSpeed = 200;
	style = { transition : 'all ' + this.transitionSpeed + 'ms ease-in-out' }
	timeout = window.setTimeout(()=>{},0)

	componentDidMount(){
		setTimeout(e => this.setState({open : true}), 10)

		if(this.props.duration){
			this.timeout = window.setTimeout(()=>{
				this.close()
			}, this.props.duration)
		}
	}

	render(){
		return 	<div className={'item'} data-type={this.props.type} data-open={this.state.open} style={this.style}>
					<span dangerouslySetInnerHTML={{__html : this.props.text}}/>
					<Icon type={IconType.CLOSE} onClick={ e => this.close(this.props.id)}/>
				</div>
	}

	close(){
		clearTimeout(this.timeout);
		
		this.setState({open : false}, ()=>{
			setTimeout(e => this.props.handleClose(this.props.id), this.transitionSpeed)
		})
	}
}

// notification container
const Notification = ({notifications, dispatch}) => {
	return 	<div className="element notification">
				{notifications.map( (notification, i) => <NotificationItem key={i} {...notification} handleClose={ id => dispatch(notificationRemove(id)) }/> )}
			</div>
}

// proptypes
Notification.propTypes = {
	notifications : PropTypes.array,
	dispatch : PropTypes.func
}

// redux mapping
const mapStateToProps = (state) => {
	return {notifications: state.notifications}
}

export default connect(mapStateToProps)(Notification)