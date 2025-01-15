import http from 'k6/http';
import { check, sleep } from 'k6';

// Configurations
export const options = {
  stages: [
    // { duration: '5s', target: 1 }
    { duration: '30s', target: 10 }, // Ramp-up to 10 users over 30 seconds
    { duration: '1m', target: 10 },  // Stay at 10 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp-down to 0 users over 30 seconds
  ],
};

const payload = JSON.stringify({
    "starting_balance": 10000,
    "start_date": "2016-01-04",
    "end_date": "2026-01-02",
    "trading_bot": {
      "name": "New Trading Bot",
      "rebalance": "daily",
      "id": "new",
      "node_type": "root",
      "description": "",
      "children": [
          {
              "id": "5e4aa7c6-81ef-4b68-bf97-8f9913a1cd31",
              "node_type": "wt-cash-equal",
              "children": [
                  {
                      "weight": {
                          "num": 100,
                          "den": 100
                      },
                      "id": "5811db0f-357b-4104-94ea-a7501f4b71df",
                      "node_type": "group",
                      "name": "10d RSI HYD > 10d RSI IYZ",
                      "children": [
                          {
                              "node_type": "wt-cash-equal",
                              "id": "6ef32806-b2fe-4a49-9f39-838f576e40e6",
                              "children": [
                                  {
                                      "id": "cdbe8337-e418-4f85-bc39-69f1842fd1d9",
                                      "node_type": "if-then-else",
                                      "condition_type": "allOf",
                                      "conditions": [
                                          {
                                              "node_type": "condition",
                                              "lhs_fn": "relative-strength-index",
                                              "lhs_fn_params": {
                                                  "window": 10
                                              },
                                              "lhs_val": "HYD",
                                              "rhs_fn": "relative-strength-index",
                                              "rhs_fn_params": {
                                                  "window": 10
                                              },
                                              "rhs_val": "IYZ",
                                              "comparator": "gt"
                                          }
                                      ],
                                      "then_children": [
                                          {
                                              "ticker": "TQQQ",
                                              "exchange": "XNAS",
                                              "name": "ProShares UltraPro QQQ",
                                              "id": "8b6f212c-e237-4764-9f83-ed0293a35059",
                                              "node_type": "asset"
                                          }
                                      ],
                                      "else_children": [
                                          {
                                              "ticker": "SQQQ",
                                              "exchange": "ARCX",
                                              "name": "ProShares Short QQQ",
                                              "id": "72463f12-d3da-44f7-86aa-9f83dd176ae1",
                                              "node_type": "asset"
                                          }
                                      ]
                                  }
                              ]
                          }
                      ]
                  }
              ]
          }
      ]
  }
})

const headers = { 'Content-Type': 'application/json' };

export default function () {
  const res = http.post('http://backtester:3000/api/v1/backtests-worker', payload, { headers });

  // Validate the response
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}