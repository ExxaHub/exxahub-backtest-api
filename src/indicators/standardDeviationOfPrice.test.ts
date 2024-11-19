import { describe, it, expect } from "bun:test";
import type { OHLCBar } from "../types";
import { standardDeviationOfPrice } from "./standardDeviationOfPrice";

describe("stdDev", () => {
  const bars: OHLCBar[] = [
    { date: "2024-11-10", open: 100, high: 105, low: 95, close: 100, volume: 10 },
    { date: "2024-11-11", open: 101, high: 106, low: 96, close: 102, volume: 10 },
    { date: "2024-11-12", open: 102, high: 107, low: 97, close: 104, volume: 10 },
    { date: "2024-11-13", open: 103, high: 108, low: 98, close: 106, volume: 10 },
    { date: "2024-11-14", open: 104, high: 109, low: 99, close: 108, volume: 10 },
  ];

  it("should calculate standard deviation for a valid period", () => {
    const params = { window: 3 };
    const result = standardDeviationOfPrice("TEST", params, bars);

    expect(result).toEqual({
      "2024-11-12": 1.63, // Standard deviation of [100, 102, 104]
      "2024-11-13": 1.63, // Standard deviation of [102, 104, 106]
      "2024-11-14": 1.63, // Standard deviation of [104, 106, 108]
    });
  });

  it("should return an empty object if the period is larger than the number of bars", () => {
    const params = { window: 6 }; // Period > number of bars
    expect(() => standardDeviationOfPrice("TEST", params, bars)).toThrow(`Not enough data to calculate for window size`);
  });

  it("should throw an error for a window size of 0 or less", () => {
    const invalidParams = { window: 0 };

    expect(() => standardDeviationOfPrice("TEST", invalidParams, bars)).toThrow(
      "Window size must be greater than zero"
    );
  });

  it("should handle edge case with exactly `window` bars", () => {
    const params = { window: 5 }; // Period == number of bars
    expect(() => standardDeviationOfPrice("TEST", params, bars)).toThrow(`Not enough data to calculate for window size`);
  });

  it("should return an empty object for an empty bars array", () => {
    const params = { window: 3 };
    expect(() => standardDeviationOfPrice("TEST", params, [])).toThrow(`Not enough data to calculate for window size`);
  });
});
