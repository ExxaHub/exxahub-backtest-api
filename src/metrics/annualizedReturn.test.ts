import { describe, it, expect } from "bun:test";
import { annualizedReturn } from "./annualizedReturn"; // Replace with the correct path

describe("calculateAnnualizedReturn", () => {
    it("should calculate the correct annualized return for positive cumulative return", () => {
        const result = annualizedReturn(0.25, 500, 252);
        expect(result).toBeCloseTo(0.11903236254391847, 3); // 12.3% annualized return
    });

    it("should calculate the correct annualized return for negative cumulative return", () => {
        const result = annualizedReturn(-0.10, 365, 252);
        expect(result).toBeCloseTo(-0.070, 3); // -7.0% annualized return
    });

    it("should return 0 for a cumulative return of 0", () => {
        const result = annualizedReturn(0, 365, 252);
        expect(result).toBe(0);
    });

    it("should handle a single-period scenario correctly", () => {
        const result = annualizedReturn(0.10, 1, 252);
        expect(result).toBeCloseTo(26974702266.758465, 1); // High return due to compounding
    });

    it("should handle fractional periods correctly", () => {
        const result = annualizedReturn(0.10, 365.5, 252);
        expect(result).toBeCloseTo(0.067, 2); // Approximately 6.7%
    });

    it("should throw an error for totalPeriods <= 0", () => {
        expect(() => annualizedReturn(0.25, 0, 252)).toThrow("Periods must be greater than zero.");
    });

    it("should throw an error for periodsInYear <= 0", () => {
        expect(() => annualizedReturn(0.25, 365, 0)).toThrow("Periods must be greater than zero.");
    });

    it("should handle very small cumulative returns", () => {
        const result = annualizedReturn(0.0001, 365, 252);
        expect(result).toBeCloseTo(0.000068, 5); // Small annualized return
    });

    it("should handle very large cumulative returns", () => {
        const result = annualizedReturn(10, 365, 252);
        expect(result).toBeGreaterThan(4); // Exponential growth
    });
});
