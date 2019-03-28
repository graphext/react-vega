import * as  React from 'react';
import { Spec } from 'vega';
import Vega, { VegaProps } from './Vega';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type Props = Omit<VegaProps, 'spec'>;
// USAGE:
// createClassFromSpec(spec);
export default function createClassFromSpec(spec: Spec) {
	function Chart(props: Props) {
		return <Vega spec={spec} {...props} />;
	}

	Chart.getSpec = function getSpec() {
		return spec;
	};

	return Chart;
}
