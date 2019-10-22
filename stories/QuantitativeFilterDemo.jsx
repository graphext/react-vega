/* eslint-disable no-magic-numbers */
import React from 'react';

import brushingBarChartData1 from './vega/brushingBarChartData1.json';
import brushingBarChartData2 from './vega/brushingBarChartData2.json';
import brushingBarChartSpec from './vega/brushingBarChartSpec';
import BrushingBarChart from './BrushingBarChart.jsx';
import SegmentsTable from './SegmentsTable.jsx';

const rows1 = [
  [
    "",
    "min",
    "p25",
    "p50",
    "p75",
    "max",
    "sum"
  ],
  [
    "#555555",
    0,
    0,
    0,
    1,
    11,
    13
  ],
  [
    "#1f77b4",
    0,
    0,
    0,
    1,
    11,
    13
  ]
];

const rows2 = [["","min","p25","p50","p75","max","sum"],["#555555",0,0,0,1,11,13],["#1f77b4",0,0,0,0,0,0]];

const header = ["", "min", "q1", "q2", "q3", "max", "sum"]


const chartProps = {
  "isDate": false,
  "width": 262,
  "backgroundColor": "#bbb",
  "foregroundColor": "#0091e6",
  "renderer": "canvas",
  "inverted": true,
  "fontFamily": "LatoLatin",
  "relative": false,
  "foregroundMargin": 2,
  "tooltipOptions": {
    "fields": [
      {
        "field": "humanizedBackground",
        "title": "everything"
      },
      {
        "field": "humanizedForeground",
        "title": "selection"
      },
      {
        "field": "left",
        "title": "from",
        "format": ".2~s"
      },
      {
        "field": "right",
        "title": "to",
        "format": ".2~s"
      }
    ],
    "theme": "graphext"
  },
  "height": 150
};

export default class QuantitativeFilter extends React.Component {
  _view = null;
  constructor(props) {
    super(props);
    this.state = {
      data: brushingBarChartData1,
      spec: brushingBarChartSpec,
      rows: rows1,
      odd: false
    };

    this.handleUpdateData = this.handleUpdateData.bind(this);
    this.handleUpdateDataTwice = this.handleUpdateDataTwice.bind(this);
  }

  handleUpdateData() {
    this.setState(JSON.parse(JSON.stringify({ data: brushingBarChartData2 })));
  }

  handleUpdateDataTwice() {
    setTimeout(() => {
    this.setState(this.state.odd ? 
      JSON.parse(JSON.stringify({ odd: false, rows: rows1})):
      JSON.parse(JSON.stringify({ odd: true, rows: rows2 }))
    );
    }, 0);
    setTimeout(() => {
      console.log('After 1 timeout');
      this.setState(this.state.odd ? 
        JSON.parse(JSON.stringify({ data: brushingBarChartData2 })):
        JSON.parse(JSON.stringify({ data: brushingBarChartData1 }))
      );
    }, 0);
  }

  statsTable(rows) {
    const header = rows[0].map(cell => {
      if (cell in QUANTILE_SELECTION_RANGES) {
        const [left, right] = QUANTILE_SELECTION_RANGES[cell];
        return (
          <a onClick={() => this.handleFilterRange([column.stats[left], column.stats[right]])} >
            {statsLabels[cell]}
          </a>
        );
      }
      return cell;
    });

  return (
      <SegmentsTable
        type="quantitative"
        header={header}
        rows={rows.slice(1)}
      />
    );
  }

  render() {
    const { data, rows } = this.state;
    
    return (
      <div>
        <button type="button" onClick={this.handleUpdateData}>
          Update data
        </button>
        <button type="button" onClick={this.handleUpdateDataTwice}>
          Update data async twice
        </button>
        <h3>
          <code>&lt;BrushingBarChart&gt;</code> React Component
        </h3>
        Will update when data changes.
        {this.statsTable(rows)}
        <BrushingBarChart
          {...chartProps}
          chartBackgroundColor="transparent"
          data={data}
          bgField={chartProps.relative ? 'rBackground' : 'background'}
          fgField={chartProps.relative ? 'rForeground' : 'foreground'}
          onFilterRange={console.log}
          onFilterStop={console.log}
          onLeftRangeClick={console.log}
          onRightRangeClick={console.log}
          onBarClick={console.log}
          ref={this.setChildRef}
        />
      </div>
    );
  }
}

const QUANTILE_SELECTION_RANGES = {
	p25: ['min', 'p25'],
	p50: ['p25', 'p75'],
	p75: ['p75', 'max']
};


export const statsLabels = {
	min: 'min',
	p25: 'q1',
	p50: 'median',
	p75: 'q3',
	max: 'max',
	sum: 'sum'
};