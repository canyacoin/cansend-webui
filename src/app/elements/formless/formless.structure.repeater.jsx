import React from 'react'

import { Icon, IconType, Hint } from 'app.elements'
import './formless.scss';

export default class FormlessRepeater extends React.Component{

	constructor(props){
		super(props);
		this.initialItems = props.value.slice(0) || []
		this.template = props.children;
		this.state = {
			items : this.initialItems
		}
		this.fields = []
		this.fieldRef = null;
	}

	componentDidMount(){
		let valid = this.isValid();
	
		window.setTimeout(()=>{
			let event = new CustomEvent('field.init', { 
				bubbles: true, 
				detail: {
					name : this.props.name, 
					value : this.state.items, 
					valid : valid, 
					setError : () => this.setState({status : 'error'}),
					label : this.props.label
				}
			});

			this.fieldRef.dispatchEvent(event);
		}, 20)
	}

	componentWillReceiveProps(nextProps){
		if (String(Object.values(this.props).sort()) !== String(Object.values(nextProps).sort())) {
			this.setState({items : nextProps.value.slice(0) || []}, () => this.propagateChange())
		}
	}

	render(){
		return 	<div className={'-structure repeater'}>
					
					<label className="fieldlabel fl-button">
						{this.props.label}
						{this.props.sublabel && <span className="message">{this.props.sublabel}</span>}
						{this.props.tip && 
							<Hint text={this.props.tip}>
								<Icon type={IconType.QUESTION} shade="dark" underline="true"/>
							</Hint>
						}
						{this.props.message && <span className="message">{this.props.message}</span>}
					</label>

					{this.state.items.length > 0 && 
						<button className={'repeater-clear'} onClick={ e => {
								e.preventDefault()
								this.props.onPrompt({
									text : 'You are about to clear all fields.',
									accept : () => {
										this.deleteAll()
									}
								})
							}}>
								Clear all
								<Icon type={IconType.PLUSCIRCLE} className={'delete'}/>
						</button>
					}

					<div className="repeater-header">
						{this.props.children.map( (field, i) => {
							return <span key={i} style={{width : field.props.width+'%'}}>{field.props.label}</span>
						})}
					</div>

					<div className="repeater-items" ref={el => {this.fieldRef = el}} >
							{this.state.items.map( (row, i) => {
								return <div className="repeater-row" key={i}>
									{this.fields[i] = []}
									{this.props.children.map( (field, j) => {
										
										let name = this.props.name + '_' + field.props.name
										
										return React.cloneElement(field, {
											ref : el => { this.fields[i][j] = el },
											name : `${name}[${i}]`, 
											value : row[name], 
											selfmanaged: false,
											emitchanges : false,
											key : j, 
											label : null, 
											onChange : e => this.handleChange(name, e.value, i),
											onKeypress : (e) => {
												if((e.key === 'Enter' || e.key === 'Tab') && i === this.state.items.length - 1 && j === this.props.children.length - 1) this.addRow(e)
											}
										})

									})}
									<Icon type={IconType.PLUSCIRCLE} className={'delete'} onClick={()=>this.deleteRow(i)}/>
								</div>
							})}
					</div>

					<div className="repeater-controls">
						<button className={'repeater-add'} onClick={ e => this.addRow(e)}>{this.props.addText}</button>
					</div>
				</div>
	}

	handleChange(key, value, index){
		let items = this.state.items;
		items[index][key] = value
		this.setState({items : items}, this.propagateChange)
	}

	propagateChange(){
		let valid = this.isValid();
		let detail = {name : this.props.name, value : this.state.items, valid : valid };
		var event = new CustomEvent('field.change', { bubbles: true, detail: detail });
		this.fieldRef.dispatchEvent(event);
		if (this.props.onChange) this.props.onChange(this.state.items)
	}

	addRow(e){
		e.preventDefault();

		let fields = {}
		this.props.children.map( field => {
			fields[this.props.name + '_' + field.props.name] = null;
			return null;
		})

		this.state.items.push(fields)
		this.setState({items : this.state.items}, this.propagateChange)
		if (this.props.onAdd) this.props.onAdd(this.state.items)
	}

	deleteRow(i){
		this.state.items.splice(i, 1)
		this.setState({items : this.state.items}, this.propagateChange)
	}

	deleteAll(){
		console.log(this.initialItems)
		this.setState({items : this.initialItems}, this.propagateChange)
		if (this.props.onClear) this.props.onClear()
	}
	
	// TODO | daniel | check validation
	// need to look at all children and determine validity of each
	isValid(){
		return true;
	}
}