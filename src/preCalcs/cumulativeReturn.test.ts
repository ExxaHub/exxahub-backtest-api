import { describe, it, expect } from "bun:test";
import { cumulativeReturn } from "./cumulativeReturn";

describe("cumulativeReturn", () => {
    it("should calculate cumulative return for a valid window", () => {
        const returns = [
            { date: "2023-01-01", value: 0.01 },
            { date: "2023-01-02", value: -0.005 },
            { date: "2023-01-03", value: 0.02 },
            { date: "2023-01-04", value: -0.01 },
            { date: "2023-01-05", value: 0.015 }
        ];
        const result = cumulativeReturn(returns, { window: 3 });
        expect(result).toEqual({
            "2023-01-04": expect.any(Number),
            "2023-01-05": expect.any(Number)
        });
    });

    it("should throw an error for a window less than 2", () => {
        const returns = [
            { date: "2023-01-01", value: 0.01 },
            { date: "2023-01-02", value: -0.005 }
        ];
        expect(() => cumulativeReturn(returns, { window: 1 })).toThrow("Not enough data to calculate cumulative return for a window of 1.");
    });

    it("should throw an error for insufficient data", () => {
        const returns = [
            { date: "2023-01-01", value: 0.01 }
        ];
        expect(() => cumulativeReturn(returns, { window: 2 })).toThrow("Not enough data to calculate cumulative return for a window of 2.");
    });

    it("should handle an exact window size", () => {
        const returns = [
            { date: "2023-01-01", value: 0.01 },
            { date: "2023-01-02", value: -0.005 },
            { date: "2023-01-03", value: 0.02 }
        ];
        const result = cumulativeReturn(returns, { window: 2 });
        expect(result).toEqual({
            "2023-01-03": expect.any(Number)
        });
    });
});