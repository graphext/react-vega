import * as React from 'react';
import { changeset, Datum, Padding, parse, Renderers, SignalListenerHandler, Spec, TooltipHandler, View } from 'vega';

import { capitalize, isDefined, isFunction } from './util';


const defaultProps = {
	className: '',
	renderer: 'svg' as Renderers,
	enableHover: true,
	onNewView: (_: View) => undefined,
	onParseError: (_: Error) => undefined
};

type ViewProperty = 'width' | 'height' | 'logLevel' | 'renderer' | 'padding' | 'tooltip';

const viewProperties: Array<ViewProperty> = [
	'logLevel',
	'renderer',
	'width',
	'height',
	'padding',
	'tooltip'
];

type DefaultProps = Readonly<typeof defaultProps>;

// TODO: How to get dynamic adding of onSignal... validation work?
interface Handlers {
	[onSignalHandlerName: string]: SignalListenerHandler | any;
}

export type VegaProps = {
	style?: React.CSSProperties;
	spec: Spec;
	logLevel?: number;
	width?: number;
	height?: number;
	tooltip?: TooltipHandler;
	// background?: string;
	padding?: Partial<Padding>;
	data?: { [name: string]: Array<Datum>};
} & Partial<DefaultProps> & Partial<Handlers>;

class Vega extends React.Component<VegaProps> {

	static defaultProps = defaultProps;

	static isSamePadding(a?: Partial<Padding>, b?: Partial<Padding>) {
		if (isDefined(a) && isDefined(b) && typeof (a) !== 'number' && typeof (b) !== 'number') {
			return a!.top === b!.top
				&& a!.left === b!.left
				&& a!.right === b!.right
				&& a!.bottom === b!.bottom;
		}
		return a === b;
	}

	static isSameData(a: Array<Datum>, b: Array<Datum>): boolean {
		return a === b && !isFunction(a);
	}

	static isSameSpec(a: Spec, b: Spec): boolean {
		return a === b
			|| JSON.stringify(a) === JSON.stringify(b);
	}

	static listenerName(signalName: string): string {
		return `onSignal${capitalize(signalName)}`;
	}

	view: View | null;

	element: Element;

	componentDidMount() {
		this.createView(this.props.spec);
	}

	componentDidUpdate(prevProps: VegaProps) {
		if (this.props.spec !== prevProps.spec) {
			this.clearView();
			this.createView(this.props.spec);
		} else if (this.view) {
			const props = this.props;
			const spec = this.props.spec;
			let changed = false;

			// update view properties
			viewProperties
				.filter(field => props[field] !== prevProps[field])
				.forEach(field => {
					props[field] &&
						this.view &&
							(this.view[field] as (value: number | Partial<Padding> | Renderers | TooltipHandler) => View)(props[field]!);
					changed = true;
				});

			if (!Vega.isSamePadding(props.padding, prevProps.padding) && (props.padding || spec.padding)) {
				this.view.padding((props.padding || spec.padding)!);
				changed = true;
			}

			// update data
			if (spec.data && props.data) {
				spec.data.forEach(d => {
					const oldData = prevProps.data![d.name];
					const newData = props.data![d.name];
					if (!Vega.isSameData(oldData, newData)) {
						this.updateData(d.name, newData);
						changed = true;
					}

				});
			}

			if (props.enableHover !== prevProps.enableHover) {
				changed = true;
			}

			if (changed) {
				if (props.enableHover) {
					this.view.hover();
				}
				this.view.runAsync();
			}
		}
	}

	componentWillUnmount() {
		this.clearView();
	}

	createView(spec: Spec) {
		if (!this.props.data && !spec.data) {
			throw new Error('Data not provided for Vega');
		}
		if (spec) {
			const props = this.props;
			// Parse the vega spec and create the view
			try {
				const runtime = parse(spec);
				const view = new View(runtime)
					.initialize(this.element);

				// Attach listeners onto the signals
				if (spec.signals) {
					spec.signals.forEach(signal => {
						view.addSignalListener(signal.name, (...args) => {
							const listener: SignalListenerHandler = this.props[Vega.listenerName(signal.name)];
							if (listener) {
								listener.apply(this, args);
							}
						});
					});
				}

				// store the vega.View object to be used on later updates
				this.view = view;

				viewProperties
					.filter(field => isDefined(props[field]))
					.forEach(field => {
						props[field] &&
							(view[field] as (value: number | Partial<Padding> | Renderers | TooltipHandler) => View)(props[field]!);
					});

				if (spec.data && props.data) {
					spec.data
						.filter(d => props.data![d.name])
						.forEach(d => {
							this.updateData(d.name, props.data![d.name]);
						});
				}
				if (props.enableHover) {
					view.hover();
				}
				view.runAsync();

				props.onNewView!(view);
			} catch (ex) {
				this.clearView();
				props.onParseError!(ex);
			}
		} else {
			this.clearView();
		}
		return this;
	}

	updateData(name: string, value: Array<Datum>) {
		if (!this.view) {
			throw new Error('Vega isn\'t properly inited');

		}
		if (value) {
			if (isFunction(value)) {
				// TODO ???
				(value as any as (_: Array<Datum>) => void)(this.view.data(name));
			} else {
				this.view.change(
					name,
					changeset()
						.remove(() => true)
						.insert(value),
				);
			}
		}
	}

	clearView() {
		if (this.view) {
			this.view.finalize();
			this.view = null;
		}
		return this;
	}

	render() {
		return (
			// Create the container Vega draws inside
			<div
				ref={c => c && (this.element = c)}
				className={this.props.className}
				style={this.props.style}
			/>
		);
	}

}

export default Vega;

export { Vega };
