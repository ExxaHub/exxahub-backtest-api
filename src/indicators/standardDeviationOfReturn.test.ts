import { describe, it, expect } from "bun:test";
import { type OHLCBar } from "../types";
import { standardDeviationOfReturn } from "./standardDeviationOfReturn";

describe("standardDeviationOfReturn", () => {
    const sampleBars: OHLCBar[] = [
        { date: "2024-11-10", open: 100, high: 110, low: 95, close: 105, volume: 1000 },
        { date: "2024-11-11", open: 105, high: 115, low: 100, close: 110, volume: 1200 },
        { date: "2024-11-12", open: 110, high: 120, low: 105, close: 115, volume: 1300 },
        { date: "2024-11-13", open: 115, high: 125, low: 110, close: 120, volume: 1400 },
        { date: "2024-11-14", open: 120, high: 130, low: 115, close: 125, volume: 1500 },
    ];

    it("calculates the standard deviation of returns correctly for a valid window", () => {
        const params = { window: 3 };
        const result = standardDeviationOfReturn("TEST", params, sampleBars);

        // Expected returns:
        // Day 1 (110 - 105) / 105 = 0.04762
        // Day 2 (115 - 110) / 110 = 0.04545
        // Day 3 (120 - 115) / 115 = 0.04348
        // Mean: (0.04762 + 0.04545 + 0.04348) / 3 = 0.04552
        // Variance: [(0.04762 - 0.04552)^2 + (0.04545 - 0.04552)^2 + (0.04348 - 0.04552)^2] / 3
        // Std Dev: sqrt(variance)

        expect(result).toEqual({
            "2024-11-14": 0.0015468821699171481,
        });

    });

    it("throws an error if there are not enough bars for the given window", () => {
        const params = { window: 5 }; // Requires at least 6 bars
        expect(() => standardDeviationOfReturn("TEST", params, sampleBars)).toThrow(
            "Not enough data to calculate standard deviation of return for a window of 5."
        );
    });

    it("handles a minimal valid window of 1", () => {
        const params = { window: 1 };
        const result = standardDeviationOfReturn("TEST", params, sampleBars);

        // Expected return:
        // Single return: (125 - 120) / 120 = 0.04167
        // Std Dev: 0 (all returns are identical)

        expect(result).toEqual({
            "2024-11-14": 0,
        });
    });

    it("throws an error if the bars array is empty", () => {
        const params = { window: 3 };
        expect(() => standardDeviationOfReturn("TEST", params, [])).toThrow(
            "Not enough data to calculate standard deviation of return for a window of 3."
        );
    });

    it("throws an error if the window is zero", () => {
        const params = { window: 0 };
        expect(() => standardDeviationOfReturn("TEST", params, sampleBars)).toThrow(
            "Not enough data to calculate standard deviation of return for a window of 0."
        );
    });

    it("handles a window size equal to the number of available bars minus one", () => {
        const params = { window: 4 };
        const result = standardDeviationOfReturn("TEST", params, sampleBars);

        // Expected returns:
        // Day 1: (110 - 105) / 105 = 0.04762
        // Day 2: (115 - 110) / 110 = 0.04545
        // Day 3: (120 - 115) / 115 = 0.04348
        // Day 4: (125 - 120) / 120 = 0.04167
        // Std Dev: sqrt(variance of these returns)

        expect(result).toEqual({
            "2024-11-14": 0.0022192006381178027,
        });
    });
});
