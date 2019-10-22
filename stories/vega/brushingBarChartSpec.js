export default {
  "$schema": "https://vega.github.io/schema/vega/v5.0.json",
  "background": "transparent",
  "title": { "text": "", "orient": "top", "anchor": "start" },
  "width": 262,
  "height": 150,
  "autosize": "fit",
  "config": {
    "title": { "color": "#62656F" },
    "axis": {
      "labelColor": "#62656F",
      "font": "LatoLatin",
      "domainColor": "#62656F",
      "tickColor": "#62656F"
    },
    "text": {
      "fill": "#ccc",
      "font": "LatoLatin",
      "fontSize": 12,
      "strokeWidth": 2,
      "stroke": null
    },
    "events": { "defaults": { "prevent": true } }
  },
  "data": [
    { "name": "data" },
    { "name": "selected" }
  ],
  "signals": [
    { "name": "undefined" },
    { "name": "filterRange", "update": "internalFilterRange" },
    {
      "name": "internalFilterRange",
      "update": "data(\"selected\")[0] ? data(\"selected\")[0].filterRange : undefined"
    },
    { "name": "leftRangeClick" },
    { "name": "rightRangeClick" },
    { "name": "filterStop" },
    { "name": "barClick" },
    { "name": "internalBrush" }
  ],
  "marks": [
    {
      "type": "group",
      "name": "bars",
      "encode": {
        "enter": {
          "x": { "value": 0 },
          "y": { "value": 0 },
          "height": { "signal": "height" },
          "width": { "signal": "width" },
          "fill": { "value": "transparent" },
          "cursor": { "value": "crosshair" }
        }
      },
      "signals": [
        {
          "name": "internalBrush",
          "value": "undefined",
          "on": [
            { "events": "@bars:mousedown, @bars:touchstart", "update": "null" },
            {
              "events": "[@bars:mousedown, window:mouseup] > window:mousemove!{30}, [@bars:touchstart, window:touchend] > window:touchmove!{30}, [@background:mousedown, window:mouseup] > window:mousemove!{30}, [@background:touchstart, window:touchend] > window:touchmove!{30}",
              "update": "x() < xdown ? [clamp(x(), 0, width), xdown] : [xdown, clamp(x(), 0, width)]"
            },
            {
              "events": { "signal": "delta" },
              "update": "clampRange([anchor[0] + delta, anchor[1] + delta], 0, width)"
            },
            {
              "events": { "signal": "leftDelta" },
              "update": "clampRange([anchor[0] + leftDelta, anchor[1]], 0, width)"
            },
            {
              "events": { "signal": "rightDelta" },
              "update": "clampRange([anchor[0], anchor[1] + rightDelta], 0, width)"
            }
          ]
        },
        {
          "name": "barClick",
          "push": "outer",
          "on": [
            {
              "events": "@foreground:click!, @background:click!",
              "update": "datum",
              "force": true
            }
          ]
        },
        {
          "name": "filterStop",
          "push": "outer",
          "on": [
            {
              "events": "window:mouseup, window:touchend",
              "update": "filterRange"
            }
          ]
        },
        {
          "name": "anchor",
          "value": null,
          "on": [
            {
              "events": "@brush:mousedown, @brush:touchstart, @leftSlider:mousedown, @leftSlider:touchstart, @rightSlider:mousedown, @rightSlider:touchstart",
              "update": "internalFilterRange ? [scale(\"x\", internalFilterRange[0]), scale(\"x\", internalFilterRange[1])] : []"
            }
          ]
        },
        {
          "name": "xdown",
          "value": 0,
          "on": [
            {
              "events": "@bars:mousedown, @bars:touchstart, @brush:mousedown, @brush:touchstart, @background:mousedown, @background:touchstart, @leftSlider:mousedown, @leftSlider:touchstart, @rightSlider:mousedown, @rightSlider:touchstart",
              "update": "x()"
            }
          ]
        },
        {
          "name": "delta",
          "value": 0,
          "on": [
            {
              "events": "[@brush:mousedown, window:mouseup] > window:mousemove!{30},  [@brush:touchstart, window:touchend] > window:touchmove!{30}",
              "update": "x() - xdown"
            }
          ]
        },
        {
          "name": "leftDelta",
          "value": 0,
          "on": [
            {
              "events": "[@leftSlider:mousedown, window:mouseup] > window:mousemove!{30},  [@leftSlider:touchstart, window:touchend] > window:touchmove!{30}",
              "update": "x() - xdown"
            }
          ]
        },
        {
          "name": "rightDelta",
          "value": 0,
          "on": [
            {
              "events": "[@rightSlider:mousedown, window:mouseup] > window:mousemove!{30},  [@rightSlider:touchstart, window:touchend] > window:touchmove!{30}",
              "update": "x() - xdown"
            }
          ]
        },
        {
          "name": "internalFilterRange",
          "push": "outer",
          "on": [
            {
              "events": { "signal": "internalBrush" },
              "update": "internalBrush ? [ invert(\"x\", internalBrush[0]), invert(\"x\", internalBrush[1]) ] : null"
            }
          ]
        },
        {
          "name": "brush",
          "value": [],
          "update": "internalFilterRange ? [ scale(\"x\", internalFilterRange[0]), scale(\"x\", internalFilterRange[1]) ] : []"
        },
        {
          "name": "leftRangeClick",
          "push": "outer",
          "on": [
            {
              "events": "@leftRange:mouseup",
              "update": "filterRange",
              "force": true
            }
          ]
        },
        {
          "name": "rightRangeClick",
          "push": "outer",
          "on": [
            {
              "events": "@rightRange:mouseup",
              "update": "filterRange",
              "force": true
            }
          ]
        },
        {
          "name": "showTooltip",
          "value": true,
          "on": [
            {
              "events": "[view:mousedown, window:mouseup] > window:mousemove!{30}, [view:touchstart, window:touchend] > window:touchmove!{30}",
              "update": "false"
            },
            { "events": "window:mouseup, window:touchend", "update": "true" }
          ]
        }
      ],
      "scales": [
        {
          "name": "x",
          "type": "linear",
          "range": "width",
          "round": true,
          "zero": false,
          "nice": false,
          "domain": {
            "fields": [
              { "data": "data", "field": "left" },
              { "data": "data", "field": "right" }
            ]
          }
        },
        {
          "name": "y",
          "type": "linear",
          "range": [{ "signal": "height" }, 0],
          "domain": {
            "fields": [
              { "data": "data", "field": "background" },
              { "data": "data", "field": "foreground" }
            ]
          },
          "nice": true,
          "zero": true,
          "round": true
        }
      ],
      "axes": [
        {
          "orient": "bottom",
          "scale": "x",
          "tickCount": 6,
          "labelFlush": true,
          "labelOverlap": "parity"
        }
      ],
      "marks": [
        {
          "type": "rect",
          "name": "background",
          "from": { "data": "data" },
          "encode": {
            "enter": { "cursor": { "value": "pointer" } },
            "update": {
              "x": { "scale": "x", "field": "left", "offset": 1 },
              "x2": { "scale": "x", "field": "right" },
              "y": { "scale": "y", "field": "background" },
              "y2": { "scale": "y", "value": 0 },
              "fill": { "value": "#bbb" },
              "tooltip": {
                "signal": "debug(showTooltip) ? {'everything':datum['humanizedBackground'],'selection':datum['humanizedForeground'],'from':format(datum['left'], '.2~s'),'to':format(datum['right'], '.2~s')} : \"\""
              }
            }
          }
        },
        {
          "type": "rect",
          "name": "foreground",
          "interactive": false,
          "from": { "data": "data" },
          "encode": {
            "update": {
              "x": { "scale": "x", "field": "left", "offset": 1 },
              "x2": { "scale": "x", "field": "right", "offset": 0 },
              "y": { "scale": "y", "field": "foreground" },
              "y2": { "scale": "y", "value": 0 },
              "fill": { "signal": "datum.color || \"#0091e6\"" },
              "tooltip": {
                "signal": "showTooltip ? {'everything':datum['humanizedBackground'],'selection':datum['humanizedForeground'],'from':format(datum['left'], '.2~s'),'to':format(datum['right'], '.2~s')} : \"\""
              }
            }
          }
        },
        {
          "type": "rect",
          "name": "brush",
          "encode": {
            "enter": {
              "y": { "value": 0 },
              "height": { "signal": "height" },
              "fill": { "value": "white" },
              "fillOpacity": { "value": 0.15 },
              "cursor": [{ "value": "move" }]
            },
            "update": {
              "tooltip": { "signal": "null" },
              "x": { "signal": "brush[0]" },
              "x2": { "signal": "brush[1]" }
            }
          }
        },
        {
          "type": "rect",
          "name": "leftSlider",
          "encode": {
            "enter": {
              "y": { "value": 0 },
              "height": { "signal": "height" },
              "fillOpacity": { "value": 0.8 },
              "cursor": [{ "value": "ew-resize" }],
              "fill": { "value": "white" }
            },
            "update": {
              "x": { "signal": "brush[0] + 1" },
              "x2": { "signal": "brush[0] - 2" }
            }
          }
        },
        {
          "type": "rect",
          "name": "rightSlider",
          "encode": {
            "enter": {
              "y": { "value": 0 },
              "height": { "signal": "height" },
              "fillOpacity": { "value": 0.8 },
              "cursor": [{ "value": "ew-resize" }],
              "fill": { "value": "white" }
            },
            "update": {
              "x": { "signal": "brush[1] - 1" },
              "x2": { "signal": "brush[1] + 2" }
            }
          }
        },
        {
          "type": "text",
          "name": "leftRange",
          "encode": {
            "enter": {
              "y": { "signal": "height", "offset": 30 },
              "cursor": { "value": "pointer" }
            },
            "update": {
              "x": { "signal": "brush[0]" },
              "align": {
                "signal": "brush[0] > width / 2 ? \"right\" : \"left\""
              },
              "text": {
                "signal": "internalFilterRange ? format(internalFilterRange[0], '.2~s') : ''"
              }
            }
          }
        },
        {
          "type": "text",
          "name": "rightRange",
          "encode": {
            "enter": {
              "y": { "value": 0, "offset": -6 },
              "cursor": { "value": "pointer" }
            },
            "update": {
              "x": { "signal": "brush[1]" },
              "align": {
                "signal": "brush[1] > width / 2 ? \"right\" : \"left\""
              },
              "text": {
                "signal": "internalFilterRange ? format(internalFilterRange[1], '.2~s') : ''"
              }
            }
          }
        }
      ]
    }
  ]
};
