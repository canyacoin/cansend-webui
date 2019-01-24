import React, {Fragment} from 'react'
import Field from './formless.field.jsx'
import './formless.scss';

export default class FormlessToggle extends Field {
	constructor(props){
		super(props)
		this.showMessage = false;
		this.type = 'toggle';
	}

	field(){
		let onLabel = this.props.labels.on ? this.props.labels.on  : 'on';
		let offLabel = this.props.labels.off ? this.props.labels.off  : 'off';

		return 	<Fragment>
					<span 
						ref={el => {this.fieldRef = el}} 
						data-value={this.state.currentValue} 
						data-on-label={onLabel} 
						data-off-label={offLabel} 
						onClick={ e => { 
							if(this.state.editable) this.handleSave(!this.state.currentValue)}
						}
					/>
					<input type="checkbox" name={this.props.name} value={this.state.currentValue} checked={this.state.currentValue === true} onChange={e=>{}}/>
				</Fragment>
	}
}