import { describe, it, expect } from "bun:test";
import { calmerRatio } from "./calmerRatio";

describe("calculateCalmarRatio", () => {
    it("should calculate the correct Calmar ratio given hardcoded annualized return and max drawdown", () => {
        const annualizedReturn = 0.20; // 20% annual return (hardcoded)
        const maxDrawdown = 0.25; // 25% max drawdown (hardcoded)

        // Calculate Calmar ratio
        const calmarRatio = calmerRatio(annualizedReturn, maxDrawdown);

        // Calmar Ratio = Annualized Return / Max Drawdown
        const expectedCalmarRatio = annualizedReturn / maxDrawdown;

        expect(calmarRatio).toBeCloseTo(expectedCalmarRatio, 4); // Compare to expected value
    });

    it("should throw an error for max drawdown of zero", () => {
        const annualizedReturn = 0.15; // 15% annual return
        const maxDrawdown = 0; // Zero max drawdown

        expect(() => calmerRatio(annualizedReturn, maxDrawdown)).toThrow("Maximum drawdown must be greater than zero.");
    });

    it("should throw an error if the annualized return or max drawdown is negative", () => {
        const annualizedReturn = -0.10; // -10% annual return
        const maxDrawdown = 0.15; // 15% max drawdown

        expect(() => calmerRatio(annualizedReturn, maxDrawdown)).toThrow("Annualized return must be greater than zero.");
    });
});
