import { describe, it, expect } from "bun:test";
import { cumulativeReturn } from "./CumulativeReturn";

describe("calculateCumulativeReturn", () => {
    it("should return the correct positive cumulative return", () => {
        const result = cumulativeReturn(10000, 12500);
        expect(result).toBeCloseTo(0.25, 2); // 25%
    });

    it("should return the correct negative cumulative return", () => {
        const result = cumulativeReturn(10000, 7500);
        expect(result).toBeCloseTo(-0.25, 2); // -25%
    });

    it("should return 0 when the starting and ending balances are the same", () => {
        const result = cumulativeReturn(10000, 10000);
        expect(result).toBe(0);
    });

    it("should handle very small starting balances", () => {
        const result = cumulativeReturn(1, 2);
        expect(result).toBeCloseTo(1.0, 2); // 100%
    });

    it("should handle very large balances", () => {
        const result = cumulativeReturn(1_000_000, 1_250_000);
        expect(result).toBeCloseTo(0.25, 2); // 25%
    });

    it("should throw an error for a starting balance of 0", () => {
        expect(() => cumulativeReturn(0, 10000)).toThrow();
    });
});