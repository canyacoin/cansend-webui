import React from 'react'
import { Icon, IconType, Hint } from 'app.elements'
import './formless.scss';

export const validation = {
	email : {
		regex : /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		message : 'Email address is not valid'
	},
	ethaddress : {
		regex : /^(0x){1}[0-9a-fA-F]{40}$/i,
		message : 'ETH address is not valid'
	},
	hex : {
		regex : /^([0-9a-f]{3}|[0-9a-f]{6})$/i,
		message : 'Not a valid HEX value'
	},
	number : {
		regex : /^[0-9]+([,.][0-9]+)?$/g,
		message : 'Not a valid number'
	},
	integer : {
		regex : /^\d+$/,
		message : 'Not a valid integer'
	},
}


// form field parent class and field wrapper
const FieldLabel = ({text, input, message, tip, allowempty}) => {
	return 	<label htmlFor={input} className="fieldlabel" data-allowempty={allowempty}>
				{text}
				{tip && 
					<Hint text={tip}>
						<Icon type={IconType.QUESTION} shade="dark" underline="true"/>
					</Hint>
				}
				{message && <span className="message">{message}</span>}
			</label>
}

export default class Field extends React.Component{
	constructor(props){
		super(props)

		this.state = {
			lastValue : props.value || '',
			currentValue : props.value || '',
			editable : props.noedit === true ? false : true,
			editing : false,
			status : props.status,
			message : null,
			selfmanaged : props.selfmanaged === false ? false : true
		}
		
		this.originalValue = props.value;
		this.fieldRef = null;
		this.showMessage = true;
	}

	componentDidMount(){
		let valid = null

		if(this.props.value){
			try {
				this.validate(this.props.value);
				valid = true;
			} catch(e) {
				valid = false;
			}
		}
		
		// if(!this.props.onChange){
			window.setTimeout(()=>{
				let event = new CustomEvent('field.init', { bubbles: true, detail: {name : this.props.name, value : this.props.value, valid : valid, setError : () => this.setState({status : 'error'}), label : this.props.label }});
				if(this.fieldRef) this.fieldRef.dispatchEvent(event);
			}, 20)
		// }
	}

	componentWillReceiveProps(nextProps){
		if(String(Object.values(this.props).sort()) !== String(Object.values(nextProps).sort())) {
			this.setState({
				currentValue : nextProps.value || '', 
				lastValue : nextProps.value || '', 
				editing : false, 
				status : this.state.status, 
				editable : nextProps.noedit === true ? false : true,
				selfmanaged : nextProps.selfmanaged === false ? false : true
			}, () => {
				try {
					this.validate(nextProps.value)
					this.setState({status : null})
					this.dispatchChangeEventToForm(true)
				} catch(e) {
					this.setState({status : 'error'})
				}
			} );
		}
	}

	render(){
		let field = this.field();
		if(!field) return null;

		return 	<div className={"field"} data-type={this.type} data-editable={this.state.editable} data-selfmanaged={this.state.selfmanaged} data-editing={this.state.selfmanaged === true ? this.state.editing : true} data-status={this.state.status} style={{width : this.props.width ? this.props.width + '%' : 'auto'}}>
					{this.props.label && <FieldLabel allowempty={this.props.allowempty} input="name" text={this.props.label} message={this.showMessage ? this.state.status : null} tip={this.props.tip}/>}
					<div className="field-content">
						{field}
					</div>
				</div>
	}
	
	field(){ return null }

	handleChange(value){

		// not allowed to edit or no change in value
		if(!this.state.editable || value === this.state.lastValue) {
			this.cancelEdit();
			this.dispatchChangeEvent(true)
			return;
		}

		this.setState({currentValue : value}, ()=>{
			try {
				this.validate(value);
				this.setState({status : null})
				this.dispatchChangeEvent(true)
			} catch(e) {
				this.setState({status : 'error'}, ()=>{
					this.dispatchChangeEvent(false)
					this.fieldRef.focus()
				})
			}
		})
	}

	handleSave(value){
		this.setState({currentValue : value, lastValue : value, editing: false}, ()=>{
			this.dispatchSaveEvent(true)
		})
	}

	validate(value){

		if((this.props.allowempty === false) && (!value || value === '')){
			throw new Error('Cannot be empty');
		}
		
		if(this.props.validate && validation[this.props.validate]){
			let valid = validation[this.props.validate].regex.test(String(value).toLowerCase());
			
			if(valid) {
				return true
			}else{
				throw new Error(validation[this.props.validate].message);
			}
		}
	}

	saveEdit(value){
		this.setState({currentValue : value, lastValue : value, editing: false}, ()=>{
			this.dispatchEvent(true)
		})
	}

	cancelEdit(){
		this.setState({currentValue : this.state.lastValue, editing: false, status: null, message: null})
	}

	
	// TODO

	fieldDetails(valid){
		/// TODO needs validation on data type
		let value = this.state.currentValue === parseInt(this.state.currentValue, 10) 
			? parseInt(this.state.currentValue, 10)
			: this.state.currentValue

		return {name : this.props.name, value : value, valid : valid};
	}

	dispatchChangeEvent(valid){
		this.dispatchChangeEventToForm(valid)
		if(this.props.onChange) this.props.onChange(this.fieldDetails(valid))
	}

	dispatchChangeEventToForm(valid){
		var event = new CustomEvent('field.change', { bubbles: true, detail: this.fieldDetails(valid) });
		this.fieldRef.dispatchEvent(event);
	}

	


	dispatchSaveEvent(valid){
		
		/// TODO needs validation on data type
		let value = this.state.currentValue === parseInt(this.state.currentValue, 10) 
			? parseInt(this.state.currentValue, 10)
			: this.state.currentValue

		let detail = {name : this.props.name, value : value };

		// dispatch event to form
		var event = new CustomEvent('field.save', { bubbles: true, detail: detail });
		this.fieldRef.dispatchEvent(event);
		
		// dispatch to props
		if(this.props.onSave) this.props.onSave(detail)
	}
}