import { describe, it, expect } from "bun:test";
import { sharpeRatio } from "./sharpeRatio";

describe("calculateSharpeRatio", () => {
    it("should calculate the correct Sharpe ratio with standard deviation provided", () => {
        const dailyReturns = [0.02, 0.01, -0.0045, 0.0095, -0.0217, 0.0556, 0.0158];
        const periodsInYear = 252; // Number of trading days in a year
        const meanReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;

        // Pre-calculate the standard deviation manually or use another method
        const standardDeviation = Math.sqrt(dailyReturns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) / (dailyReturns.length - 1));

        // Calculate Sharpe Ratio with the pre-calculated standard deviation
        const sharpeRatioMetric = sharpeRatio(dailyReturns, 0, periodsInYear);

        // Annualize mean return and standard deviation
        const annualizedMeanReturn = meanReturn * periodsInYear;
        const annualizedStdDev = standardDeviation * Math.sqrt(periodsInYear);

        // Expected Sharpe Ratio
        const expectedSharpeRatio = annualizedMeanReturn / annualizedStdDev;

        expect(sharpeRatioMetric).toBeCloseTo(expectedSharpeRatio, 2); // Compare with expected value
    });

    it("should calculate the correct Sharpe ratio when standard deviation is not provided", () => {
        const dailyReturns = [0.02, 0.01, -0.0045, 0.0095, -0.0217, 0.0556, 0.0158];
        const periodsInYear = 252; // Number of trading days in a year

        // Calculate Sharpe Ratio with no pre-calculated standard deviation (it will be calculated inside the function)
        const sharpeRatioMetric = sharpeRatio(dailyReturns, 0, periodsInYear);

        // Calculate expected Sharpe Ratio manually
        const meanReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
        const standardDeviation = Math.sqrt(dailyReturns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) / (dailyReturns.length - 1));
        const annualizedMeanReturn = meanReturn * periodsInYear;
        const annualizedStdDev = standardDeviation * Math.sqrt(periodsInYear);
        const expectedSharpeRatio = annualizedMeanReturn / annualizedStdDev;

        expect(sharpeRatioMetric).toBeCloseTo(expectedSharpeRatio, 2); // Compare with expected value
    });

    it("should throw an error for insufficient returns data", () => {
        expect(() => sharpeRatio([0.02])).toThrow("At least two returns are required to calculate the Sharpe ratio.");
    });

    it("should calculate the correct Sharpe ratio with a non-zero risk-free rate", () => {
        const dailyReturns = [0.02, 0.01, -0.0045, 0.0095, -0.0217, 0.0556, 0.0158];
        const riskFreeRate = 0.01;
        const periodsInYear = 252; // Number of trading days in a year

        // Calculate Sharpe Ratio with a non-zero risk-free rate
        const sharpeRatioMetric = sharpeRatio(dailyReturns, riskFreeRate, periodsInYear);

        // Calculate expected Sharpe Ratio manually
        const meanReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
        const standardDeviation = Math.sqrt(dailyReturns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) / (dailyReturns.length - 1));
        const annualizedMeanReturn = (meanReturn - riskFreeRate) * periodsInYear;
        const annualizedStdDev = standardDeviation * Math.sqrt(periodsInYear);
        const expectedSharpeRatio = annualizedMeanReturn / annualizedStdDev;

        expect(sharpeRatioMetric).toBeCloseTo(expectedSharpeRatio, 2); // Compare with expected value
    });

    it("should throw an error for insufficient returns data", () => {
        expect(() => sharpeRatio([0.02])).toThrow("At least two returns are required to calculate the Sharpe ratio.");
    });
});
