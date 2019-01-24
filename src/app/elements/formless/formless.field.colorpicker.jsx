import React, {Fragment} from 'react'
import { TwitterPicker } from 'react-color'
import Field from './formless.field.jsx'
import { Icon, IconType } from 'app.elements'
import './formless.scss';

export default class FormlessColorPicker extends Field {
	constructor(props){
		super(props)
		this.type = 'colorpicker';
	}

	field(){
		return 	<Fragment>
					{this.props.prefix && <span>{this.props.prefix} </span>}
					<input ref={el => {this.fieldRef = el}} name={this.props.name} value={this.state.currentValue} placeholder={this.props.placeholder} disabled={this.state.selfmanaged === true ? !this.state.editing : false} onChange={ e => this.handleChange(e.target.value) }></input> 
					{this.props.suffix && <span> {this.props.suffix}</span>}
					<Icon key={1} type={IconType.ADD} shade="grey" className="edit" onClick={ e => this.togglePicker() }/>
					<TwitterPicker triangle="top-right" color={this.state.currentValue} className={this.state.showPicker === true ? '-show' : '-hide'} onChange={e => this.handleChange(e.hex) }/>
				</Fragment>
	}
	
	handleChange(value){
		let val = value ? value.replace('#', '') : value;
		super.handleChange(val)
	}

	togglePicker(){
		this.setState({showPicker : !this.state.showPicker})
	}
}