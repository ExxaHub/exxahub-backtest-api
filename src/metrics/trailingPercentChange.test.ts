import { describe, it, expect } from "bun:test";
import { trailingPercentChange } from "./trailingPercentChange";
import type { AllocationResult } from "../services/Backtester";

// Sample data
const sampleData: AllocationResult[] = [
    { date: "2022-08-01", value: 100, tickers: {} },
    { date: "2022-09-01", value: 120, tickers: {} },
    { date: "2022-10-01", value: 100, tickers: {} },
    { date: "2022-11-01", value: 110, tickers: {} },
    { date: "2022-12-01", value: 90, tickers: {} },
    { date: "2023-01-01", value: 100, tickers: {} },
    { date: "2023-02-01", value: 110, tickers: {} },
    { date: "2023-03-01", value: 120, tickers: {} },
    { date: "2023-04-01", value: 130, tickers: {} },
    { date: "2023-05-01", value: 140, tickers: {} },
    { date: "2023-06-01", value: 150, tickers: {} },
    { date: "2023-07-01", value: 160, tickers: {} },
    { date: "2023-08-01", value: 170, tickers: {} },
    { date: "2023-09-01", value: 180, tickers: {} },
    { date: "2023-10-01", value: 190, tickers: {} },
];

describe("calculateTrailingPercentChangeFromDays", () => {
    it("should throw an error if there are not enough data points", () => {
        expect(() => trailingPercentChange([], 1, 'month')).toThrow("At least one data point is required.");
    });

    it("should calculate percent change for the last month", () => {
        const result = trailingPercentChange(sampleData, 1, 'month');
        expect(result).toBeCloseTo(5.56, 2); // ((190 - 180) / 180) * 100
    });

    it("should calculate percent change for the last 3 months", () => {
        const result = trailingPercentChange(sampleData, 3, 'month');
        expect(result).toBeCloseTo(18.75, 2); // ((190 - 160) / 160) * 100
    });

    it("should calculate percent change for the last year", () => {
        const result = trailingPercentChange(sampleData, 1, 'year');
        expect(result).toBeCloseTo(90, 2); // ((190 - 100) / 100) * 100
    });
});
