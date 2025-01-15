import { describe, it, expect } from "bun:test";
import { maximumDrawdown } from "./maximumDrawdown";

describe("calculateMaxDrawdown", () => {
    it("should calculate the correct max drawdown for a typical array of portfolio values", () => {
        const values = [1000, 1200, 1100, 1050, 1150, 900, 950, 1100];
        const result = maximumDrawdown(values);
        expect(result).toBeCloseTo(0.25, 2); // Maximum drawdown of 25%
    });

    it("should return 0 for an array with increasing values", () => {
        const values = [1000, 1100, 1200, 1300];
        const result = maximumDrawdown(values);
        expect(result).toBe(0); // No drawdown, always increasing
    });

    it("should handle arrays with decreasing values", () => {
        const values = [1200, 1100, 1000, 900];
        const result = maximumDrawdown(values);
        expect(result).toBe(0.25); // Maximum drawdown of 25% (from 1200 to 900)
    });

    it("should throw an error for an array with less than two values", () => {
        expect(() => maximumDrawdown([1000])).toThrow("At least two values are required to calculate drawdown.");
    });

    it("should handle arrays with constant values", () => {
        const values = [1000, 1000, 1000, 1000];
        const result = maximumDrawdown(values);
        expect(result).toBe(0); // No drawdown, constant value
    });
});
