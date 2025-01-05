import { describe, it, expect } from "bun:test";
import { cumulativeReturn } from "./cumulativeReturn";
import type { OHLCBar } from "../types/types";

describe("cumulativeReturn", () => {
  const bars: OHLCBar[] = [
    { date: "2024-11-10", open: 100, high: 105, low: 95, close: 100, volume: 10 },
    { date: "2024-11-11", open: 101, high: 106, low: 96, close: 102, volume: 10 },
    { date: "2024-11-12", open: 102, high: 107, low: 97, close: 104, volume: 10 },
    { date: "2024-11-13", open: 103, high: 108, low: 98, close: 106, volume: 10 },
    { date: "2024-11-14", open: 104, high: 109, low: 99, close: 108, volume: 10 },
    { date: "2024-11-17", open: 105, high: 110, low: 100, close: 110, volume: 10 },
    { date: "2024-11-18", open: 106, high: 111, low: 101, close: 112, volume: 10 },
  ];

  it("should calculate the correct cumulative return for a valid period", () => {
    const params = { window: 3 };
    const result = cumulativeReturn("TEST", params, bars);

    expect(result).toEqual({
      "2024-11-13": 6,
      "2024-11-14": 5.88,
      "2024-11-17": 5.77,
      "2024-11-18": 5.66,      
    });
  });

  it("should return an empty object if the period is larger than the number of bars", () => {
    const params = { window: 8 }; // Period > number of bars

    expect(() => cumulativeReturn("TEST", params, bars)).toThrow(`Not enough data to calculate for window size`);
  });

  it("should throw an error for a window size of 0 or less", () => {
    const invalidParams = { window: 0 };

    expect(() => cumulativeReturn("TEST", invalidParams, bars)).toThrow(
      "Window size must be greater than zero"
    );
  });

  it("should handle edge case with exactly `window` bars", () => {
    const params = { window: 7 }; // Period == number of bars
    expect(() => cumulativeReturn("TEST", params, bars)).toThrow(`Not enough data to calculate for window size`);
  });

  it("should return an empty object for an empty bars array", () => {
    const params = { window: 3 };
    expect(() => cumulativeReturn("TEST", params, [])).toThrow(`Not enough data to calculate for window size`);
  });
});
