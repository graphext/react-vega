export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isDefined(x: any): boolean {
	return x !== null && x !== undefined;
}

export function isFunction(functionToCheck: any): boolean {
	const getType = {};
	return !!functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
