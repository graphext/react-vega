import isEqual from 'lodash.isequal';
import _Merge from 'lodash.merge';

import Chart, {defaultProps} from './Chart';
import { SpecParametrized } from './spec.js';


const brushingBarChartDefaultProps = {
	brushColor: 'white',
	brushOpacity: 0.15,
	sliderOpacity: 0.8,
	labelSize: 12,
	foregroundMargin: 6,
	dateFormat: '%c'
};

class BrushingBarChart extends Chart {

	static defaultProps = {
		...defaultProps,
		...brushingBarChartDefaultProps
	};

	dirtySpec = true;
	cachedSpec = null;

	buildSpec(props) {
		if (this.dirtySpec) {
			this.cachedSpec = SpecParametrized(props);
		}
		return this.cachedSpec;
	}

	buildProps(vgSpec, props) {
		const signalHandlers = vgSpec.signals && vgSpec.signals.reduce((handlers, signal) =>
			({
				...handlers,
				[`onSignal${signal.name.charAt(0).toUpperCase()}${signal.name.slice(1)}`]: this.handleSignal
			}),
			{});
		return _Merge({
			spec: vgSpec,
			...signalHandlers
		}, props);
	}

	handleSignal =
		(signal, values) => {
			this.props.logLevel &&
				this.props.logLevel > 1 &&
				console.debug('BrushingBarChart.handleSignal(', signal, ',', values, ')');
			const handlerName = `on${signal.charAt(0).toUpperCase()}${signal.slice(1)}`;
			if (this.props[handlerName] && this._view && values !== undefined) {
				const currentValues = this.props.data.selected[0] ? this.props.data.selected[0].filterRange : null;
				const avoidPropagation = (signal === 'filterStop' || signal === 'filterRange') && isEqual(currentValues, values);
				!avoidPropagation && this._view.runAsync().then(() => this.props[handlerName](values));
			}
		}

	componentWillReceiveProps(nextProps) {
		nextProps = { ...nextProps, data: null };
		const props = { ...this.props, data: null };

		this.dirtySpec = JSON.stringify(nextProps) !== JSON.stringify(props);
	}

	// shouldComponentUpdate(nextProps) {
	// 	// TODO: teanocrata fix it instead of hide it
	// 	return this.dirtySpec || !shallowEqual(nextProps.data, this.props.data);
	// }
}

export default BrushingBarChart;


const EMPTY = {};

function shallowEqual(a = EMPTY, b = EMPTY) {
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);

	return a === b || (aKeys.length === bKeys.length && aKeys.every(key => a[key] === b[key]));
}
