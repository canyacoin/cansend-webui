import React, {Fragment} from 'react'
import Field from './formless.field.jsx'
//import { Icon, IconType } from 'app.elements'
import './formless.scss';

export default class FormlessSelect extends Field {

	constructor(props){
		super(props);
		this.type = 'select';
		
		this.default = props.default || props.options[0].value

		this.state = Object.assign({}, this.state, {
			select_value : this.default,
			select_label : props.options.filter( o => {return o.value === this.default})[0].label,
			select_open : false
		})
	}

	field(){
		return 	<Fragment>
					<div className="content-container" data-open={this.state.select_open}>
						<div ref={el => {this.fieldRef = el}} className="current" onClick={ e => this.setState({select_open : !this.state.select_open}) }> {this.state.select_label} </div>
						{<div className="options"> {this.options()} </div>}
					</div>
				</Fragment>
	}

	options(){
		return this.props.options.map((option) => (
			<span className="option" key={option.value} value={option.value} onClick={e => this.handleChange(option.value) }>
				{option.label}
			</span>
		))
	}

	handleChange(value){
		this.setState({
			select_open : false, 
			select_value: value, 
			select_label : this.props.options.filter( o => {return o.value === value})[0].label
		}, ()=>{
			if (this.props.onChange) this.props.onChange({value : this.state.select_value, label : this.state.select_label})
		})
	}
}