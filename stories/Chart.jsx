import * as React from 'react';

import _Merge from 'lodash.merge';
import Vega from '../packages/react-vega/src/Vega';
import { Handler } from 'vega-tooltip';

export const defaultProps = {
	backgroundColor: '#4ba4f3',
	bgField: 'background',
	chartBackgroundColor: 'transparent',
	fgField: 'foreground',
	fontFamily: 'sans-serif',
	foregroundColor: '#efbc22',
	foregroundMargin: 6,
	inverted: false,
	isDate: false,
	relative: false,
	title: '',
	niceXScale: false
};


const exportChart = () => {};
const toCanvas = () => {};
const toSVG = () => {};

export class Chart extends React.Component {

	_view = null;

	constructor(props) {
		super(props);
	}
	buildSpec(props);

	buildProps(vgSpec, props) {
		const { padding, ...rest } = props;
		return vgSpec.padding !== undefined ? _Merge({ spec: vgSpec }, rest) : _Merge({ spec: vgSpec }, props);
	}
	/**
	 * Use this to download the image
	 */
	download(type, filename, background, width, event) {
		return exportChart(this._view, type, filename, background, width, event);
	}

	/**
	 * Use this to get the canvas of the chart
	 */
	toCanvas(background, width, event) {
		return toCanvas(this._view, background, width, event);
	}

	/**
	 * Generate a static SVG image (svg string)
	 */
	toSVG(background, width, event) {
		return toSVG(this._view, background, width, event);
	}

	toSpec() {
		const reactVegaProps = {
			...this.buildProps(this.buildSpec(this.props), this.props)
		};
		reactVegaProps.spec.data.splice(0, 1, {...reactVegaProps.spec.data[0], values: reactVegaProps.data.data});
		reactVegaProps.spec.data.splice(1, 1, {...reactVegaProps.spec.data[1], values: reactVegaProps.data.selected});
		return {
			...reactVegaProps.spec
		};
	}

	render() {
		const vgSpec = this.buildSpec(this.props);
		const props = this.buildProps(vgSpec, this.props);
		const reactVegaProps = {
			...props,
			onNewView: view => this._view = view,
			...props.tooltipOptions ? { tooltip: new Handler(props.tooltipOptions).call } : {}
		};

		return (
			<Vega {...reactVegaProps} />
		);
	}
}

export default Chart;
