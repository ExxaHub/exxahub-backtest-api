import { describe, expect, it } from "bun:test";
import { maxDrawdown } from "./maxDrawdown";
import type { OHLCBar } from "../types";

describe("maxDrawdown", () => {
    const mockBars: OHLCBar[] = [
        { date: "2024-11-10", open: 102, high: 105, low: 95, close: 100, volume: 10 },
        { date: "2024-11-11", open: 101, high: 106, low: 96, close: 97, volume: 10 },
        { date: "2024-11-12", open: 99, high: 108, low: 94, close: 100, volume: 10 },
        { date: "2024-11-13", open: 103, high: 107, low: 93, close: 91, volume: 10 },
        { date: "2024-11-14", open: 104, high: 110, low: 92, close: 100, volume: 10 },
        { date: "2024-11-17", open: 102, high: 107, low: 93, close: 91, volume: 10 },
        { date: "2024-11-18", open: 101, high: 110, low: 92, close: 100, volume: 10 },
    ];

    it("calculates max drawdown for a valid window", () => {
        const params = { window: 7 };
        const result = maxDrawdown("TEST", params, mockBars);

        expect(result).toEqual({
            "2024-11-10": 0,
            "2024-11-11": 3,
            "2024-11-12": 3,
            "2024-11-13": 9,
            "2024-11-14": 9,
            "2024-11-17": 9,
            "2024-11-18": 9,
        });
    });

    it("returns an empty object if window is larger than bars length", () => {
        const params = { window: 10 };
        expect(() => maxDrawdown("TEST", params, mockBars)).toThrow(
            `Not enough data to calculate max drawdown for a window of ${params.window}.`
        );
    });

    it("throws an error if window is zero or negative", () => {
        const paramsZero = { window: 0 };
        const paramsNegative = { window: -1 };

        expect(() => maxDrawdown("TEST", paramsZero, mockBars)).toThrow(
            "Window size must be greater than zero"
        );
        expect(() => maxDrawdown("TEST", paramsNegative, mockBars)).toThrow(
            "Window size must be greater than zero"
        );
    });

    it("handles a single bar in the array gracefully", () => {
        const params = { window: 1 };
        const singleBar: OHLCBar[] = [
            { date: "2024-11-10", open: 100, high: 105, low: 95, close: 100, volume: 10 },
        ];

        const result = maxDrawdown("TEST", params, singleBar);
        expect(result).toEqual({
            "2024-11-10": 0, // No drawdown in a single bar
        });
    });

    it("calculates drawdown correctly when all bars have increasing highs", () => {
        const params = { window: 3 };
        const increasingBars: OHLCBar[] = [
            { date: "2024-11-10", open: 100, high: 101, low: 99, close: 100, volume: 10 },
            { date: "2024-11-11", open: 101, high: 102, low: 100, close: 101, volume: 10 },
            { date: "2024-11-12", open: 102, high: 103, low: 101, close: 102, volume: 10 },
            { date: "2024-11-13", open: 103, high: 104, low: 102, close: 103, volume: 10 },
        ];

        const result = maxDrawdown("TEST", params, increasingBars);

        expect(result).toEqual({
            "2024-11-11": 0,
            "2024-11-12": 0,
            "2024-11-13": 0,
        });
    });

    it("calculates drawdown correctly when all bars have decreasing lows", () => {
        const params = { window: 3 };
        const decreasingBars: OHLCBar[] = [
            { date: "2024-11-10", open: 100, high: 105, low: 90, close: 100, volume: 10 },
            { date: "2024-11-11", open: 100, high: 103, low: 85, close: 99, volume: 10 },
            { date: "2024-11-12", open: 100, high: 102, low: 80, close: 98, volume: 10 },
            { date: "2024-11-13", open: 100, high: 101, low: 75, close: 97, volume: 10 },
        ];

        const result = maxDrawdown("TEST", params, decreasingBars);

        expect(result).toEqual({
            "2024-11-11": 0,
            "2024-11-12": 1.0101010101010102,
            "2024-11-13": 2.0202020202020203,
        });
    });
});
