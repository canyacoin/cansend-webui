import React from 'react';
import { connect } from 'react-redux'
import Dropzone from 'react-dropzone';
import logo from 'app.images/cansend_logo.svg';
import './dragdrop.scss';

class DragDrop extends React.Component{
	constructor(props){
		super(props)
		this.state = {}
		
		this.mimeTypes = {
			csv : [
				'application/csv',
				'application/x-csv',
				'text/csv',
				'text/*',
				'text/*,',
				'application/vnd.ms-excel',
				'text/comma-separated-values',
				'text/x-comma-separated-values',
				'text/tab-separated-values'
			]	
		}

		this.accept = this.mimeTypes ? Object.keys(this.mimeTypes).map( key =>{ return this.mimeTypes[key].join(',') }).join(',') : {}
		this.mimeKeys =  this.mimeTypes ? Object.keys(this.mimeTypes) : 'error';
	}

	render(){
		return <Dropzone 
			accept={this.accept}
			multiple={false}
			onDrop={ (a, r) => this.handleDrop(a[0], r) } 
			disableClick={true} 
			style={{}} 
			className={'component dragdrop '+this.props.visible}
			data-visible={this.props.visible}
			activeClassName={'active'} 
			acceptClassName={'accept'} 
			rejectClassName={'reject'}
			onDragLeave={() => this.props.onMouseOut()}
			onDropAccepted={() => this.props.onMouseOut()}
			onDropRejected={() => this.props.onMouseOut()}
		>
			<div className="inner">
				<img className="logo" src={logo} alt="CanSend"/>
				<span className="icon"/>
				<p className="message accept">Drop your CSV file here to populate the text area.</p>
				<p className="message reject">
					One or more of the files you're trying to upload is no allowed. 
					<span className="smaller">
						Please upload one of the following file types: {this.mimeKeys}
					</span>
				</p>
			</div>
		</Dropzone>
	}

	handleDrop(file, rejected){
		if(file){
			let reader = new FileReader()
			reader.onload = e => this.props.handleUpload(e.target.result)
			reader.readAsText(file)
		}

		// handle rejected
		if(rejected && rejected.length >= 1) this.props.handleRejection(rejected.map((item) => item.name))
	}
}

// redux mapping
const mapStateToProps = (state) => {
	return {visible: state.dragdrop}
}

export default connect(mapStateToProps)(DragDrop);