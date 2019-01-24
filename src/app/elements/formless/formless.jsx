import React from 'react'
import './formless.scss';

export const FormlessSubmit = ({label="Submit"}) => {
	const handlClick = (e) => {
		e.preventDefault();
		e.stopPropagation();

		var event = new CustomEvent('form.submit', { bubbles: true });
		e.target.dispatchEvent(event);
	}

	return <button onClick={ e => handlClick(e) } type="submit" value="Submit" className="element button submit">{label}</button>
}

export const FormlessColumn = ({children, width}) => {
	return <div className="-column" style={{width : width + '%'}}>{children}</div>
}

export const FormlessRow = ({className, children}) => {
	return <div className={"-row" + (className ? ' '+className : '')}>{children}</div>
}

export default class Formless extends React.Component{
	constructor(props){
		super(props)
		this.fieldRef = null;
		this.state = {};
	}

	componentDidMount(){
		this.fieldRef.addEventListener('field.init', e => {
			e.preventDefault();
			e.stopPropagation();
			this.initField(e.detail.name, e.detail.value, e.detail.valid, e.detail.setError, e.detail.label)
		}, false);

		this.fieldRef.addEventListener('field.change', e => {
			e.preventDefault();
			e.stopPropagation();
			this.updateField(e.detail.name, e.detail.value, e.detail.valid)
		}, false);

		this.fieldRef.addEventListener('field.save', e => {
			e.preventDefault();
			e.stopPropagation();
			if(this.props.onFieldSave) this.props.onFieldSave(e.detail)
		}, false);

		this.fieldRef.addEventListener('form.submit', e => {
			e.preventDefault();
			e.stopPropagation();

			// itterate values & return validation
			let valid = true;
			let fields = {};
			let invalidFields = {}
			Object.keys(this.state).filter(key => {
				fields[key] = this.state[key].value
			
				if(this.state[key].valid !== true){
					valid = false;
					invalidFields[key] = {
						validation : this.state[key].validation,
						label : this.state[key].label
					}
				}

				return false
			})

			if(!valid){
				// itterate over invalid fields an force validation 
				let invalidLabels = Object.keys(invalidFields).map((key)=>{
					if (typeof invalidFields[key].validation === 'function') invalidFields[key].validation()
					return invalidFields[key].label;
				}).filter( item => item);

				if(this.props.onError) this.props.onError(invalidLabels)
			}else{
				if(this.props.onSubmit) this.props.onSubmit(fields)
			}

			
		}, false);
	}

	initField(key, value, valid, validation, label){
		let newstate = this.state
		newstate[key] = { value : value, valid : valid, validation : validation, label : label }
		this.setState(newstate)
	}

	updateField(key, value, valid){
		let newstate = this.state

		// TODO | daniel | handle indexed values
		//console.log(this.state)
		
		// var match = key.match(/[(\d)]/i)
		// if(match){
			
		// 	console.log(key, value, match[0])

		// 	// newstate[key] = {
		// 	// 	...this.state[key],
		// 	// 	value : value,
		// 	// 	valid : valid
		// 	// }
		// }else{
		// 	newstate[key] = {
		// 		...this.state[key],
		// 		value : value,
		// 		valid : valid
		// 	}
		// }

		
		newstate[key] = {
			...this.state[key],
			value : value,
			valid : valid
		}

		this.setState(newstate)
	}

	render(){
		return <form ref={el => {this.fieldRef = el}} className="element formless" data-valid={this.state.valid}  autoComplete="off"> {this.props.children} </form>
	}
}


// easy imports/exports
// export {FormlessSubmit as Submit}
// export {FormlessColumn as Column}
// export {FormlessRow as Row}

// structure
export {default as FormlessRepeater} from './formless.structure.repeater.jsx'

// fields
export {default as FormlessInput} from './formless.field.input.jsx'
export {default as FormlessSelect} from './formless.field.select.jsx'
export {default as FormlessToggle} from './formless.field.toggle.jsx'
export {default as FormlessColorPicker} from './formless.field.colorpicker.jsx'