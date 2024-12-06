import { describe, it, expect } from "bun:test";
import { movingAverageOfReturn } from "./movingAverageOfReturn";
import type { OHLCBar } from "../types";

describe("movingAverageOfReturn", () => {
    const sampleBars: OHLCBar[] = [
        { date: "2024-11-10", open: 100, high: 110, low: 95, close: 105, volume: 10 },
        { date: "2024-11-11", open: 105, high: 115, low: 100, close: 110, volume: 10 },
        { date: "2024-11-12", open: 110, high: 120, low: 105, close: 115, volume: 10 },
        { date: "2024-11-13", open: 115, high: 125, low: 110, close: 120, volume: 10 },
        { date: "2024-11-14", open: 120, high: 130, low: 115, close: 125, volume: 10 },
        { date: "2024-11-17", open: 125, high: 135, low: 120, close: 130, volume: 10 },
        { date: "2024-11-18", open: 130, high: 140, low: 125, close: 135, volume: 10 },
    ];

    it("calculates the moving average of returns correctly for a valid window", () => {
        const params = { window: 3 };
        const result = movingAverageOfReturn("TEST", params, sampleBars);

        expect(result).toEqual({
            "2024-11-12": 0.046536796536796536,
            "2024-11-13": 0.044466403162055336,
            "2024-11-14": 0.04257246376811594,
            "2024-11-17": 0.04083333333333333,
            "2024-11-18": 0.039230769230769236
        });
    });

    it("throws an error if there are not enough bars for the given window", () => {
        const params = { window: 8 }; // Requires at least 6 bars
        expect(() => movingAverageOfReturn("TEST", params, sampleBars)).toThrow(
            "Not enough data to calculate moving average of return for a window of 8."
        );
    });

    it("handles a minimal valid window of 2", () => {
        const params = { window: 2 };
        const result = movingAverageOfReturn("TEST", params, sampleBars);

        // Expected return:
        // (125 - 120) / 120 = 0.04167

        expect(result).toEqual({
            "2024-11-11": 0.047619047619047616,
            "2024-11-12": 0.045454545454545456,
            "2024-11-13": 0.043478260869565216,
            "2024-11-14": 0.041666666666666664,
            "2024-11-17": 0.04,
            "2024-11-18": 0.038461538461538464,
        });
    });

    it("throws an error if the bars array is empty", () => {
        const params = { window: 3 };
        expect(() => movingAverageOfReturn("TEST", params, [])).toThrow(
            "Not enough data to calculate moving average of return for a window of 3."
        );
    });

    it("throws an error if the window is zero", () => {
        const params = { window: 0 };
        expect(() => movingAverageOfReturn("TEST", params, sampleBars)).toThrow(
            "Not enough data to calculate moving average of return for a window of 0."
        );
    });

    it("handles a window size equal to the number of available bars minus one", () => {
        const params = { window: sampleBars.length - 1 };
        const result = movingAverageOfReturn("TEST", params, sampleBars);

        // Expected returns:
        // (110 - 105) / 105 = 0.04762
        // (115 - 110) / 110 = 0.04545
        // (120 - 115) / 115 = 0.04348
        // (125 - 120) / 120 = 0.04167
        // Moving average: (0.04762 + 0.04545 + 0.04348 + 0.04167) / 4 = 0.04456

        expect(result).toEqual({
            "2024-11-17": 0.043643704121964985,
            "2024-11-18": 0.04181220229046316,
        });
    });
});
