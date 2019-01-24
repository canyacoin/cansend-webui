import React, {Fragment} from 'react'
import Field from './formless.field.jsx'
import { Icon, IconType } from 'app.elements'
import './formless.scss';

export default class FormlessInput extends Field {

	constructor(props){
		super(props)
		this.type = 'input';
	}
		
	handleKeyPress(e){
		if(this.state.selfmanaged !== true){
			this.handleSave(this.fieldRef.value)
		}else if(e.key === "Escape"){
			this.cancelEdit()
		}

		if(this.props.onKeypress) this.props.onKeypress(e)
	}

	field(){
		return 	<Fragment>
					{this.props.prefix && <span className='prefix'>{this.props.prefix} </span>}
					<input ref={el => {this.fieldRef = el}} name={this.props.name} value={this.state.currentValue} placeholder={this.props.placeholder} disabled={this.state.selfmanaged === true ? !this.state.editing : false} onKeyDown={e=>this.handleKeyPress(e)} onChange={ e => this.handleChange(this.fieldRef.value) } {...this.props.attrs}></input> 
					{this.props.suffix && <span className='suffix'> {this.props.suffix}</span>}
					{this.state.editable && this.state.selfmanaged && [
						<Icon key={1} type={IconType.EDIT} shade="grey" className="edit" onClick={ e => this.startEditing() }/>,
						<Icon key={2} type={IconType.TICK} shade="grey" className="save" onClick={ e => this.handleSave(this.fieldRef.value)}/>,
						<Icon key={3} type={IconType.CANCEL} shade="grey" className="cancel" onClick={ e => this.cancelEdit()}/>,
						<Icon key={4} type={IconType.LOADING} className="loading"/>
					]}
				</Fragment>
	}

	startEditing(){
		if(this.state.status !== 'updating') this.setState({editing : true}, () => this.fieldRef.focus());
	}
}