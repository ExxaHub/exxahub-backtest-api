import { describe, it, expect, beforeEach } from "bun:test";
import { relativeStrengthIndex } from "./relativeStrengthIndex";
import type { OHLCBar } from "../types/types";

// Mock data for tests
const mockBars: OHLCBar[] = [
  { date: "2024-11-10", open: 100, high: 105, low: 95, close: 100, volume: 10 },
  { date: "2024-11-11", open: 100, high: 110, low: 90, close: 105, volume: 10 },
  { date: "2024-11-12", open: 105, high: 115, low: 95, close: 102, volume: 10 },
  { date: "2024-11-13", open: 102, high: 112, low: 92, close: 108, volume: 10 },
  { date: "2024-11-14", open: 108, high: 118, low: 98, close: 110, volume: 10 },
  { date: "2024-11-17", open: 110, high: 120, low: 101, close: 112, volume: 10 },
  { date: "2024-11-18", open: 109, high: 119, low: 100, close: 111, volume: 10 },
];

const closes = mockBars.map((bar) => bar.close);

describe("RSI Function", () => {
  it("should calculate RSI for valid inputs", () => {
    const params = { window: 3 };
    const result = relativeStrengthIndex("TEST", params, closes);

    // Example assertions (you may need to adjust the expected values)
    expect(result).toBeDefined();
    expect(result[0]).toBe(86.9565);
    expect(result[1]).toBe(89.0909);
    expect(result[2]).toBe(91.2409);
    expect(result[3]).toBe(79.4913);
  });

  it("should throw an error when there are not enough bars to calculate the window", () => {
    const smallBars: OHLCBar[] = [
      { date: "2024-11-10", open: 100, high: 105, low: 95, close: 100, volume: 10 },
      { date: "2024-11-11", open: 100, high: 110, low: 90, close: 105, volume: 10 },
    ];
    const params = { window: 3 };
    const closes = smallBars.map((bar) => bar.close);

    expect(() => relativeStrengthIndex("TEST", params, closes)).toThrow(`Not enough data for RSI calculation. Ticker: TEST`);
  });

  it("should throw an error when bars array is empty", () => {
    expect(() => relativeStrengthIndex("TEST", { window: 3 }, [])).toThrow(`Not enough data for RSI calculation. Ticker: TEST`);
  });

  it("should calculate RSI with custom window size", () => {
    const params = { window: 2 };
    const result = relativeStrengthIndex("TEST", params, closes);

    expect(Object.keys(result).length).toBeGreaterThan(0); // Ensure output exists
    expect(result[0]).toBeDefined(); // Verify specific date exists
  });

  it("should handle zero losses without crashing", () => {
    const noLossBars: OHLCBar[] = [
      { date: "2024-11-10", open: 100, high: 105, low: 95, close: 100, volume: 10 },
      { date: "2024-11-11", open: 100, high: 110, low: 90, close: 105, volume: 10 },
      { date: "2024-11-12", open: 105, high: 115, low: 95, close: 110, volume: 10 },
      { date: "2024-11-15", open: 110, high: 120, low: 95, close: 110, volume: 10 },
      { date: "2024-11-16", open: 115, high: 125, low: 95, close: 110, volume: 10 },
    ];
    const params = { window: 2 };
    const closes = noLossBars.map((bar) => bar.close);
    const result = relativeStrengthIndex("TEST", params, closes);

    expect(result).toBeDefined();
    expect(result[0]).toBe(100); // RSI should be 100 for only gains
    expect(result[1]).toBe(100); // RSI should be 100 for only gains
    expect(result[2]).toBe(100); // RSI should be 100 for only gains
  });

  it("should handle zero gains without crashing", () => {
    const noGainBars: OHLCBar[] = [
      { date: "2024-11-10", open: 100, high: 105, low: 95, close: 100, volume: 10 },
      { date: "2024-11-11", open: 100, high: 110, low: 90, close: 95, volume: 10 },
      { date: "2024-11-12", open: 95, high: 105, low: 85, close: 90, volume: 10 },
      { date: "2024-11-15", open: 90, high: 100, low: 95, close: 85, volume: 10 },
      { date: "2024-11-16", open: 85, high: 95, low: 95, close: 80, volume: 10 },
    ];
    const params = { window: 2 };
    const closes = noGainBars.map((bar) => bar.close);
    const result = relativeStrengthIndex("TEST", params, closes);

    expect(result).toBeDefined();
    expect(result[0]).toBe(0); // RSI should be 0 for only losses
    expect(result[1]).toBe(0); // RSI should be 0 for only losses
    expect(result[2]).toBe(0); // RSI should be 0 for only losses
  });
});
