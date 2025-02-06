import { describe, it, expect } from "bun:test";
import { exponentialMovingAverageOfPrice } from "./exponentialMovingAverageOfPrice";
import type { OHLCBar } from "../types/types";

describe("exponentialMovingAverageOfPrice", () => {
  const bars: OHLCBar[] = [
    { date: "2024-11-10", open: 100, high: 105, low: 95, close: 100, volume: 10 },
    { date: "2024-11-11", open: 101, high: 106, low: 96, close: 102, volume: 10 },
    { date: "2024-11-12", open: 102, high: 107, low: 97, close: 104, volume: 10 },
    { date: "2024-11-13", open: 103, high: 108, low: 98, close: 106, volume: 10 },
    { date: "2024-11-14", open: 104, high: 109, low: 99, close: 108, volume: 10 },
    { date: "2024-11-17", open: 105, high: 110, low: 100, close: 110, volume: 10 },
    { date: "2024-11-18", open: 106, high: 111, low: 101, close: 112, volume: 10 },
  ];

  const closes = bars.map((bar) => bar.close);

  it("should calculate the correct moving average for a valid period", () => {
    const params = { window: 3 };
    const result = exponentialMovingAverageOfPrice("TEST", params, closes);

    expect(result).toEqual([
      102.5,
      104.25,
      106.125,
      108.0625,
      110.03125,
    ]);
  });

  it("should return an empty object if the period is larger than the number of bars", () => {
    const params = { window: 8 }; // Period > number of bars

    expect(() => exponentialMovingAverageOfPrice("TEST", params, closes)).toThrow(`Not enough data to calculate for window size`);
  });

  it("should throw an error for a window size of 0 or less", () => {
    const invalidParams = { window: 0 };

    expect(() => exponentialMovingAverageOfPrice("TEST", invalidParams, closes)).toThrow(
      "Window size must be greater than zero"
    );
  });

  it("should handle edge case with exactly `window` bars", () => {
    const params = { window: 7 }; // Period == number of bars
    expect(() => exponentialMovingAverageOfPrice("TEST", params, closes)).toThrow(`Not enough data to calculate for window size`);
  });

  it("should return an empty object for an empty bars array", () => {
    const params = { window: 3 };
    expect(() => exponentialMovingAverageOfPrice("TEST", params, [])).toThrow(`Not enough data to calculate for window size`);
  });
});
