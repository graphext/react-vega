/* with logs */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/forbid-prop-types */
import * as vega from 'vega';

import PropTypes from 'prop-types';
import React from 'react';
import { capitalize, isDefined, isFunction } from './util';

const propTypes = {
  background: PropTypes.string,
  className: PropTypes.string,
  data: PropTypes.object,
  enableHover: PropTypes.bool,
  height: PropTypes.number,
  logLevel: PropTypes.number,
  onNewView: PropTypes.func,
  onParseError: PropTypes.func,
  padding: PropTypes.object,
  renderer: PropTypes.string,
  spec: PropTypes.object.isRequired,
  style: PropTypes.object,
  tooltip: PropTypes.func,
  width: PropTypes.number,
};

const defaultProps = {
  background: undefined,
  className: '',
  data: {},
  enableHover: true,
  height: undefined,
  logLevel: undefined,
  onNewView() {},
  onParseError() {},
  padding: undefined,
  renderer: 'svg',
  style: undefined,
  tooltip: () => {},
  width: undefined,
};

class Vega extends React.Component {
  static isSamePadding(a, b) {
    console.log(`isSamePadding(`);
    console.log(a);
    console.log(`, `);
    console.log(b);
    console.log(`)`);
    if (isDefined(a) && isDefined(b)) {
      return a.top === b.top && a.left === b.left && a.right === b.right && a.bottom === b.bottom;
    }

    return a === b;
  }

  static isSameData(a, b) {
    console.log(`isSameData(`);
    console.log(a);
    console.log(`), `);
    console.log(b);
    console.log(`)`);
    const se = shallowEqual(a, b);
    console.log(`shallowEqual(a, b):${se} && !isFunction(a):${!isFunction(a)}`);
    console.log(`return a === b ${a === b} && !isFunction(a) ${!isFunction(a)}`);
    return a === b && !isFunction(a);
  }

  static isSameSpec(a, b) {
    console.log(`isSameSpec(`);
    console.log(a);
    console.log(`, `);
    console.log(b);
    console.log(`)`);
    return a === b || JSON.stringify(a) === JSON.stringify(b);
  }

  static listenerName(signalName) {
    console.log(`listenerName(`);
    console.log(signalName);
    console.log(`) -> onSignal(`);
    console.log(capitalize(signalName));
    console.log(`)`);
    return `onSignal${capitalize(signalName)}`;
  }

  componentDidMount() {
    console.log(`componentDidMount()`);
    const { spec } = this.props;
    this.createView(spec);
  }

  componentDidUpdate(prevProps) {
    console.log(`componentDidUpdate(`);
    console.log(prevProps);
    console.log(`)`);
    const { spec } = this.props;
    if (spec !== prevProps.spec) {
      this.clearView();
      this.createView(spec);
    } else if (this.view) {
      const { props } = this;
      let changed = false;

      // update view properties
      ['width', 'height', 'renderer', 'logLevel', 'background']
        .filter(field => props[field] !== prevProps[field])
        .forEach(field => {
          this.view[field](props[field]);
          changed = true;
        });

      if (!Vega.isSamePadding(props.padding, prevProps.padding)) {
        this.view.padding(props.padding || spec.padding);
        changed = true;
      }

      // update data
      if (spec.data && props.data) {
        spec.data.forEach(d => {
          const oldData = prevProps.data[d.name];
          const newData = props.data[d.name];
          if (!Vega.isSameData(oldData, newData)) {
            console.log(`Old data for ${d.name} is not the same than new one -> changed!`);
            this.updateData(d.name, newData);
            changed = true;
          }
        });
      }

      if (!prevProps.enableHover && props.enableHover) {
        console.log(`Prev props have not enabled hover and now it's enabled -> changed! `);
        this.view.hover();
        changed = true;
      }

      if (changed) {
        console.log(`Changed! -> view.run()`);
        this.view.run();
      }
    }
  }

  componentWillUnmount() {
    console.log(`componentWillUnmount()`);
    this.clearView();
  }

  createView(spec) {
    console.log(`createView(`);
    console.log(spec);
    console.log(`)`);

    if (spec) {
      const { props } = this;
      // Parse the vega spec and create the view
      try {
        const runtime = vega.parse(spec);
        const view = new vega.View(runtime).initialize(this.element);

        // Attach listeners onto the signals
        if (spec.signals) {
          spec.signals.forEach(signal => {
            view.addSignalListener(signal.name, (...args) => {
              const listener = props[Vega.listenerName(signal.name)];
              if (listener) {
                listener.apply(this, args);
              }
            });
          });
        }

        // store the vega.View object to be used on later updates
        this.view = view;

        ['logLevel', 'renderer', 'tooltip', 'background', 'width', 'height', 'padding']
          .filter(field => isDefined(props[field]))
          .forEach(field => {
            view[field](props[field]);
          });

        if (spec.data && props.data) {
          spec.data
            .filter(d => props.data[d.name])
            .forEach(d => {
              this.updateData(d.name, props.data[d.name]);
            });
        }
        if (props.enableHover) {
          view.hover();
        }
        view.run();

        props.onNewView(view);
      } catch (ex) {
        console.error(ex);
        this.clearView();
        props.onParseError(ex);
      }
    } else {
      this.clearView();
    }

    return this;
  }

  updateData(name, value) {
    console.log(`updateData(`);
    console.log(name);
    console.log(`, `);
    console.log(value);
    console.log(`)`);
    if (value) {
      if (isFunction(value)) {
        value(this.view.data(name));
      } else {
        console.log(`view.change(${name}`);
        console.log(value);
        console.log(`)`);

        this.view.change(
          name,
          vega
            .changeset()
            .remove(() => true)
            .insert(value),
        );
      }
    }
  }

  clearView() {
    console.log(`clearView()`);
    if (this.view) {
      this.view.finalize();
      this.view = null;
    }

    return this;
  }

  render() {
    console.log(`render()`);

    const { className, style } = this.props;

    return (
      // Create the container Vega draws inside
      <div
        ref={c => {
          this.element = c;
        }}
        className={className}
        style={style}
      />
    );
  }
}

Vega.propTypes = propTypes;
Vega.defaultProps = defaultProps;

export default Vega;

function shallowEqual(a = {}, b = {}) {
  if (a === b) {
    return true;
  }

  if (
    a == null ||
    b == null ||
    (!(typeof a === 'object' && a !== null) && !(typeof b === 'object' && b !== null))
  ) {
    return a !== a && b !== b;
  }

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return a === b;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  const rse =
    a === b ||
    (aKeys.length === bKeys.length &&
      aKeys.every(key => {
        const se = shallowEqual(a[key], b[key]);
        console.log(
          `key: ${key} a[key]: ${a[key]} b[key]: ${b[key]} -> shallowEqual(a[key], b[key]) ${se}`,
        );
        return se;
      }));
  console.log(`a: ${a} b: ${b} -> shallowEqual(a, b) ${rse}`);
  return rse;
}
