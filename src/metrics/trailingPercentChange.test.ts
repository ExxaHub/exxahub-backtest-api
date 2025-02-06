import { describe, it, expect } from "bun:test";
import { trailingPercentChange } from "./trailingPercentChange";
import type { AllocationResult } from "../services/Backtester";
import dayjs from "dayjs";

// Sample data
const sampleData: number[] = [
    100,
    120,
    100,
    110,
    90,
    100,
    110,
    120,
    130,
    140,
    150,
    160,
    170,
    180,
    190,
];

const dates: number[] = [
    dayjs('2022-08-01').unix(),
    dayjs('2022-09-01').unix(),
    dayjs('2022-10-01').unix(),
    dayjs('2022-11-01').unix(),
    dayjs('2022-12-01').unix(),
    dayjs('2023-01-01').unix(),
    dayjs('2023-02-01').unix(),
    dayjs('2023-03-01').unix(),
    dayjs('2023-04-01').unix(),
    dayjs('2023-05-01').unix(),
    dayjs('2023-06-01').unix(),
    dayjs('2023-07-01').unix(),
    dayjs('2023-08-01').unix(),
    dayjs('2023-09-01').unix(),
    dayjs('2023-10-01').unix(),
];

describe("calculateTrailingPercentChangeFromDays", () => {
    it("should throw an error if there are not enough data points", () => {
        expect(() => trailingPercentChange([], [], 1, 'month')).toThrow("At least one data point is required.");
    });

    it("should calculate percent change for the last month", () => {
        const result = trailingPercentChange(sampleData, dates, 1, 'month');
        expect(result).toBeCloseTo(5.56, 2); // ((190 - 180) / 180) * 100
    });

    it("should calculate percent change for the last 3 months", () => {
        const result = trailingPercentChange(sampleData, dates, 3, 'month');
        expect(result).toBeCloseTo(18.75, 2); // ((190 - 160) / 160) * 100
    });

    it("should calculate percent change for the last year", () => {
        const result = trailingPercentChange(sampleData, dates, 1, 'year');
        expect(result).toBeCloseTo(90, 2); // ((190 - 100) / 100) * 100
    });
});
