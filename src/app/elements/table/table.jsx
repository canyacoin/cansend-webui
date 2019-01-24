import React from 'react'
//import {Icon, IconType} from 'app.elements'
import './table.scss';

export const TableHeader = ({columns}) => (
	<thead>
		<tr>
			{columns.map( (column, i) => <th key={i}>{column}</th> )}
		</tr>
	</thead>
)

export const TableRow = ({data}) => (
	<tr>
		{data.map( (column, i) => <td key={i}>{column}</td> )}
	</tr>
)

export const TableBody = ({children}) => (
	<tbody>
		{children}
	</tbody>
)

const Table = ({state, children}) => {
	
	// let header = null;
	// let rows = children[0];

	// console.log(children)
	
	// if(children[0].type && children[0].type.displayName === 'TableHeader'){
	// 	header = children[0];
	// 	rows = children[1]
	// }

	return <section className="element table" data-state={state}>
		<table>
			{children}
		</table>
	</section>

	
}

export default Table;