import { describe, it, expect } from "bun:test";
import { standardDeviationOfReturn } from "./standardDeviationOfReturn";

describe("standardDeviationOfReturn", () => {
    it("should calculate annualized volatility for daily returns", () => {
        const returns = [0.01, -0.005, 0.02, -0.01, 0.015];
        const result = standardDeviationOfReturn(returns);
        expect(result).toBeCloseTo(0.1867, 2); // Approximately 18.67%
    });

    it("should throw an error for an empty returns array", () => {
        expect(() => standardDeviationOfReturn([])).toThrow("Returns array must not be empty.");
    });

    it("should handle a single return value", () => {
        const returns = [0.01];
        const result = standardDeviationOfReturn(returns);
        expect(result).toBe(0); // Volatility is 0 for a single value
    });

    it("should throw an error for periodsInYear <= 0", () => {
        const returns = [0.01, 0.02, 0.03];
        expect(() => standardDeviationOfReturn(returns, 0)).toThrow("Periods in a year must be greater than zero.");
    });
});
