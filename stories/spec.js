// tslint:disable:max-line-length

function formatToolTipFields(props, propName = 'tooltipOptions') {
	return props[propName].fields
		? JSON.stringify(
			props[propName].fields.reduce((signal, field) => {
				return {
					...signal,
					[`'${field.title}'`]: field.format
						? `format(datum['${field.field}'], '${field.format}')`
						: field.timeFormat
							? `timeFormat(datum['${field.field}'], '${field.timeFormat}')`
							: `datum['${field.field}']`
				};
			}, {})
		).replace(/\"/g, '')
		: 'datum';
}


export const SpecParametrized = (
	props
) => ({
	$schema: 'https://vega.github.io/schema/vega/v5.0.json',
	background: props.chartBackgroundColor,
	title: {
		text: props.title,
		orient: 'top',
		anchor: 'start'
	},
	width: props.width,
	height: props.height,
	padding: props.padding && (typeof props.padding === 'number' ? props.padding : { top: 0, bottom: 0, right: 0, left: 0, ...props.padding }),
	autosize: props.autosize || 'fit',
	config: {
		title: {
			color: props.inverted ? '#62656F' : 'black'
		},
		axis: {
			labelColor: props.inverted ? '#62656F' : 'black',
			font: props.fontFamily,
			...(props.inverted
				? {
					domainColor: '#62656F',
					tickColor: '#62656F'
				}
				: {})
		},
		text: {
			fill: props.inverted ? '#ccc' : '#777',
			font: props.fontFamily,
			fontSize: props.labelSize,
			strokeWidth: 2,
			...(props.inverted ? { stroke: null } : {})
		},
		events: {
			defaults: {
				prevent: true
			}
		}
	},
	data: [
		{
			name: 'data',
			...(props.isDate
				? {
					transform: [
						{
							type: 'formula',
							as: 'left',
							expr: 'time(datum.left)'
						},
						{
							type: 'formula',
							as: 'right',
							expr: 'time(datum.right)'
						}
					]
				}
				: {})
		},
		{
			name: 'selected',
			...(props.isDate
				? {
					transform: [
						{
							type: 'formula',
							as: 'filterRange',
							expr:
								'[time(datum.filterRange[0]), time(datum.filterRange[1])]'
						}
					]
				}
				: {})
		}
	],
	signals: [
		{
			name: 'undefined'
		},
		{
			name: 'filterRange',
			...props.isDate ? {
				update: 'internalFilterRange ? [utcFormat(internalFilterRange[0], "%Y-%m-%dT%H:%M:%S.%LZ"), utcFormat(internalFilterRange[1], "%Y-%m-%dT%H:%M:%S.%LZ")] : internalFilterRange'
			} : {
				update: 'internalFilterRange'
			}
		},
		{
			name: 'internalFilterRange',
			update: 'data("selected")[0] ? data("selected")[0].filterRange : undefined'
		},
		{
			name: 'leftRangeClick'
		},
		{
			name: 'rightRangeClick'
		},
		{
			name: 'filterStop'
		},
		{
			name: 'barClick'
		},
		{
			name: 'internalBrush'
		}
	],
	marks: [
		{
			type: 'group',
			name: 'bars',
			encode: {
				enter: {
					x: {
						value: 0
					},
					y: {
						value: 0
					},
					height: {
						signal: 'height'
					},
					width: {
						signal: 'width'
					},
					fill: {
						value: 'transparent'
					},
					cursor: {
						value: 'crosshair'
					}
				}
			},
			signals: [
				{
					name: 'internalBrush',
					value: 'undefined',
					on: [
						{
							events: '@bars:mousedown, @bars:touchstart',
							update: 'null'
						},
						{
							events:
								'[@bars:mousedown, window:mouseup] > window:mousemove!{30}, [@bars:touchstart, window:touchend] > window:touchmove!{30}, [@background:mousedown, window:mouseup] > window:mousemove!{30}, [@background:touchstart, window:touchend] > window:touchmove!{30}',
							update: 'x() < xdown ? [clamp(x(), 0, width), xdown] : [xdown, clamp(x(), 0, width)]'
						},
						{
							events: {
								signal: 'delta'
							},
							update: 'clampRange([anchor[0] + delta, anchor[1] + delta], 0, width)'
						},
						{
							events: { signal: 'leftDelta' },
							update: 'clampRange([anchor[0] + leftDelta, anchor[1]], 0, width)'
						},
						{
							events: { signal: 'rightDelta' },
							update: 'clampRange([anchor[0], anchor[1] + rightDelta], 0, width)'
						}
					]
				},
				{
					name: 'barClick',
					push: 'outer',
					on: [
						{
							events: '@foreground:click!, @background:click!',
							update: props.isDate ?
								'merge(datum, {left: utcFormat(datum.left, "%Y-%m-%dT%H:%M:%S.%LZ"), right: utcFormat(datum.right, "%Y-%m-%dT%H:%M:%S.%LZ")})' :
								'datum',
							force: true
						}
					]
				},
				{
					name: 'filterStop',
					push: 'outer',
					on: [
						{
							events: 'window:mouseup, window:touchend',
							update: 'filterRange'
						}
					]
				},
				{
					name: 'anchor',
					value: null,
					on: [
						{
							events:
								'@brush:mousedown, @brush:touchstart, @leftSlider:mousedown, @leftSlider:touchstart, @rightSlider:mousedown, @rightSlider:touchstart',
							update: props.isDate
								? 'internalFilterRange ? [scale("x", time(internalFilterRange[0])), scale("x", time(internalFilterRange[1]))] : []'
								: 'internalFilterRange ? [scale("x", internalFilterRange[0]), scale("x", internalFilterRange[1])] : []'
						}
					]
				},
				{
					name: 'xdown',
					value: 0,
					on: [
						{
							events:
								'@bars:mousedown, @bars:touchstart, @brush:mousedown, @brush:touchstart, @background:mousedown, @background:touchstart, @leftSlider:mousedown, @leftSlider:touchstart, @rightSlider:mousedown, @rightSlider:touchstart',
							update: 'x()'
						}
					]
				},
				{
					name: 'delta',
					value: 0,
					on: [
						{
							events:
								'[@brush:mousedown, window:mouseup] > window:mousemove!{30},  [@brush:touchstart, window:touchend] > window:touchmove!{30}',
							update: 'x() - xdown'
						}
					]
				},
				{
					name: 'leftDelta',
					value: 0,
					on: [
						{
							events:
								'[@leftSlider:mousedown, window:mouseup] > window:mousemove!{30},  [@leftSlider:touchstart, window:touchend] > window:touchmove!{30}',
							update: 'x() - xdown'
						}
					]
				},
				{
					name: 'rightDelta',
					value: 0,
					on: [
						{
							events:
								'[@rightSlider:mousedown, window:mouseup] > window:mousemove!{30},  [@rightSlider:touchstart, window:touchend] > window:touchmove!{30}',
							update: 'x() - xdown'
						}
					]
				},
				{
					name: 'internalFilterRange',
					push: 'outer',
					on: [
						{
							events: {
								signal: 'internalBrush'
							},
							update: props.isDate
								? 'internalBrush ? [ time(invert("x", internalBrush[0])), time(invert("x", internalBrush[1])) ] : null'
								: 'internalBrush ? [ invert("x", internalBrush[0]), invert("x", internalBrush[1]) ] : null'
						}
					]
				},
				{
					name: 'brush',
					value: [],
					update: props.isDate
						? 'internalFilterRange ? [ time(scale("x", internalFilterRange[0])), time(scale("x", internalFilterRange[1])) ] : []'
						: 'internalFilterRange ? [ scale("x", internalFilterRange[0]), scale("x", internalFilterRange[1]) ] : []'
				},
				{
					name: 'leftRangeClick',
					push: 'outer',
					on: [
						{
							events: '@leftRange:mouseup',
							update: 'filterRange',
							force: true
						}
					]
				},
				{
					name: 'rightRangeClick',
					push: 'outer',
					on: [
						{
							events: '@rightRange:mouseup',
							update: 'filterRange',
							force: true
						}
					]
				},
				{
					name: 'showTooltip',
					value: true,
					on: [
						{
							events:
								`[view:mousedown, window:mouseup] > window:mousemove!{30}, [view:touchstart, window:touchend] > window:touchmove!{30}`,
							update: 'false'
						},
						{
							events:
								'window:mouseup, window:touchend',
							update: 'true'
						}
					]
				},
			],
			scales: [
				// tslint:disable-next-line:no-object-literal-type-assertion
				{
					name: 'x',
					type: props.isDate ? 'time' : 'linear',
					range: 'width',
					round: true,
					...(props.isDate ? {} : { zero: false }),
					nice: props.niceXScale,
					domain: {
						fields: [
							{
								data: 'data',
								field: 'left'
							},
							{
								data: 'data',
								field: 'right'
							}
						]
					}
				},
				{
					name: 'y',
					type: 'linear',
					range: [
						{
							signal: 'height'
						},
						0
					],
					domain: {
						fields: [
							{
								data: 'data',
								field: props.bgField
							},
							{
								data: 'data',
								field: props.fgField
							}
						]
					},
					nice: true,
					zero: true,
					round: true
				}
			],
			axes: [
				{
					orient: 'bottom',
					scale: 'x',
					tickCount: 6,
					labelFlush: true,
					labelOverlap: 'parity'
				},
				...(props.relative
					? [
						{
							orient: 'right',
							scale: 'y',
							tickCount: 6,
							format: '.0%'
						}
					]
					: [])
			],
			marks: [
				{
					type: 'rect',
					name: 'background',
					from: {
						data: 'data'
					},
					encode: {
						enter: {
							cursor: {
								value: 'pointer'
							}
						},
						update: {
							x: {
								scale: 'x',
								field: 'left',
								offset: 1
							},
							x2: {
								scale: 'x',
								field: 'right'
							},
							y: {
								scale: 'y',
								field: props.bgField
							},
							y2: {
								scale: 'y',
								value: 0
							},
							fill: {
								value: props.backgroundColor
							},
							...(props.tooltipOptions
								? {
									tooltip: {
										signal: `debug(showTooltip) ? ${formatToolTipFields(props)} : ""`
									}
								}
								: {})
						}
					}
				},
				{
					type: 'rect',
					name: 'foreground',
					interactive: false,
					from: {
						data: 'data'
					},
					encode: {
						update: {
							x: {
								scale: 'x',
								field: 'left',
								offset: props.relative ? props.foregroundMargin + 1 : 1
							},
							x2: {
								scale: 'x',
								field: 'right',
								offset: props.relative ? -props.foregroundMargin : 0
							},
							y: {
								scale: 'y',
								field: props.fgField
							},
							y2: {
								scale: 'y',
								value: 0
							},
							fill: {
								signal: `datum.color || "${props.foregroundColor}"`
							},
							...(props.tooltipOptions
								? {
									tooltip: {
										signal: `showTooltip ? ${formatToolTipFields(props)} : ""`
									}
								}
								: {})
						}
					}
				},
				{
					type: 'rect',
					name: 'brush',
					encode: {
						enter: {
							y: {
								value: 0
							},
							height: {
								signal: 'height'
							},
							fill: {
								value: props.brushColor
							},
							fillOpacity: {
								value: props.brushOpacity
							},
							cursor: [
								{
									value: 'move'
								}
							]
						},
						update: {
							tooltip: { signal: 'null' },
							x: {
								signal: 'brush[0]'
							},
							x2: {
								signal: 'brush[1]'
							}
						}
					}
				},
				{
					type: 'rect',
					name: 'leftSlider',
					encode: {
						enter: {
							y: { value: 0 },
							height: { signal: 'height' },
							fillOpacity: { value: props.sliderOpacity },
							cursor: [{ value: 'ew-resize' }],
							fill: { value: props.brushColor }
						},
						update: {
							x: { signal: 'brush[0] + 1' },
							x2: { signal: 'brush[0] - 2' }
						}
					}
				},
				{
					type: 'rect',
					name: 'rightSlider',
					encode: {
						enter: {
							y: { value: 0 },
							height: { signal: 'height' },
							fillOpacity: { value: props.sliderOpacity },
							cursor: [{ value: 'ew-resize' }],
							fill: { value: props.brushColor }
						},
						update: {
							x: { signal: 'brush[1] - 1' },
							x2: { signal: 'brush[1] + 2' }
						}
					}
				},
				{
					type: 'text',
					name: 'leftRange',
					encode: {
						enter: {
							y: {
								signal: 'height',
								offset: 30
							},
							cursor: {
								value: 'pointer'
							}
						},
						update: {
							x: {
								signal: 'brush[0]'
							},
							align: {
								signal: 'brush[0] > width / 2 ? "right" : "left"'
							},
							text: {
								signal: `internalFilterRange ? ${
									props.isDate ? `timeFormat(internalFilterRange[0], "${props.dateFormat}")` : `format(internalFilterRange[0], '.2~s')`
									} : ''`
							}
						}
					}
				},
				{
					type: 'text',
					name: 'rightRange',
					encode: {
						enter: {
							y: {
								value: 0,
								offset: -6
							},
							cursor: {
								value: 'pointer'
							}
						},
						update: {
							x: {
								signal: 'brush[1]'
							},
							align: {
								signal: 'brush[1] > width / 2 ? "right" : "left"'
							},
							text: {
								signal: `internalFilterRange ? ${
									props.isDate ? `timeFormat(internalFilterRange[1], "${props.dateFormat}")` : `format(internalFilterRange[1], '.2~s')`
									} : ''`
							}
						}
					}
				}
			]
		}
	]
});
