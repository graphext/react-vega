import * as React from 'react';

const COMPARE_CARD_CONTAINER_HEIGHT = 276;
const COMPARE_CARD_CONTAINER_WIDTH = 356;
const INSIGHT_SCALE_FACTOR_TO_APPLY = 1.6;

class SegmentsTable extends React.PureComponent {

	segmentsTableRef = null;

	renderHeader(header, columnType) {
		if (columnType === 'categorical') {
			return header.map((v, i) => i > 0 && typeof v === 'string'
				? <th key={i}><div style={{ background: v }} /></th>
				: <th key={i}>{v}</th>);
		}
		return header.map((v, i) => <th key={i}>{v}</th>);
	}

	renderRows(rows, columnType) {
		if (columnType === 'categorical') {
			return rows.map((row, rowIndex) =>
				<tr key={rowIndex}>
					{row.map((v, cellIndex) => <td key={cellIndex} title={`${v}`}>{v}</td>)}
				</tr>
			);
		}
		return rows.map((row, rowIndex) =>
			<tr key={rowIndex}>
				{row.map((v, i) => (
					i > 0
						? <td title={`${v}`} key={`${i}`}>{Number(v)}</td>
						: <td title={`${v}`} key={`${i}`}>
							<div style={{ background: v }} />
						</td>
				))}
			</tr>
		);
	}

	toCanvas = (background) => {
		const height = Math.floor(COMPARE_CARD_CONTAINER_HEIGHT * INSIGHT_SCALE_FACTOR_TO_APPLY);
		const width = Math.floor(COMPARE_CARD_CONTAINER_WIDTH * INSIGHT_SCALE_FACTOR_TO_APPLY);
		return 'getCanvasFromReference(this.segmentsTableRef, background, width, width, height)';
	}

	render() {
		const { className, footer, header, rows, type } = this.props;

		if (header.length === 0 && rows.length === 0 && !footer) {
			return null;
		}
		return (
			<table
				ref={ref => this.segmentsTableRef = ref}
			>
				{header.length > 0 && <thead>
					<tr>
						{this.renderHeader(header, type)}
					</tr>
				</thead>}
				{rows.length > 0 && <tbody>
					{this.renderRows(rows, type)}
				</tbody>}
				{footer &&
					<tfoot>
						<tr>{footer.map((v, i) => <td key={i}>{v}</td>)}</tr>
					</tfoot>
				}
			</table>
		);
	}
}


export default SegmentsTable;
