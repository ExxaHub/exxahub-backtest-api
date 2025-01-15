import { describe, it, expect } from "bun:test";
import { trailingPercentChange } from "./trailingPercentChange";

// Tests
describe("calculateTrailingPercentChangeFromDays", () => {

    it("should calculate percent change for the last 1 day", () => {
        const values = [100, 105, 110, 115, 120, 125, 130];  // Daily values
        const result = trailingPercentChange(values, 1);
        expect(result).toBeCloseTo(4.00); // (130 - 125) / 125 * 100 = 4%
    });

    it("should calculate percent change for the last 3 days", () => {
        const values = [100, 105, 110, 115, 120, 125, 130];
        const result = trailingPercentChange(values, 3);
        expect(result).toBeCloseTo(13.043478260869565); // (130 - 115) / 115 * 100 = 13.04%
    });

    it("should calculate percent change for the last 6 days", () => {
        const values = [100, 105, 110, 115, 120, 125, 130];
        const result = trailingPercentChange(values, 6);
        expect(result).toBeCloseTo(30.00); // (130 - 100) / 100 * 100 = 30%
    });

    it("should throw an error if there are not enough data points", () => {
        const values = [100]; // Only one data point
        try {
            trailingPercentChange(values, 1);
        } catch (e) {
            expect((e as Error).message).toBe("At least two data points are required.");
        }
    });

    it("should throw an error if daysAgo exceeds the number of available data points", () => {
        const values = [100, 105, 110, 115]; // 4 data points
        try {
            trailingPercentChange(values, 5); // More than available data points
        } catch (e) {
            expect((e as Error).message).toBe("Not enough data points to calculate the percent change for the specified period.");
        }
    });

    it("should calculate percent change for the last 2 days", () => {
        const values = [100, 110]; // Only 2 data points
        const result = trailingPercentChange(values, 1);
        expect(result).toBeCloseTo(10.00); // (110 - 100) / 100 * 100 = 10%
    });

});
