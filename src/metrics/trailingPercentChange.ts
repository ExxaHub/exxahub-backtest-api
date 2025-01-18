import dayjs from "dayjs";
import type { AllocationResult } from "../services/Backtester";

export const trailingPercentChange = (
    values: AllocationResult[], 
    lookbackValue: number, 
    lookbackInterval: 'day' | 'month' | 'year'
): number => {
    // Step 1: Find the most recent data point (today's data point)
    const mostRecentValue = values[values.length - 1];

    if (!mostRecentValue) {
        throw new Error("At least one data point is required.");
    }

    // Step 2: Get most revent date and calculate the target date based on the lookback period
    const targetDate = dayjs(mostRecentValue.date).subtract(lookbackValue, lookbackInterval);

    // Step 3: Find the value closest to the target date (from the specified lookback period)
    let startValue: AllocationResult | null = null;

    // Iterate over the values array in reverse to find the closest date before or on the target date
    for (let i = values.length - 2; i >= 0; i--) {
        const value = values[i];

        const valueDate = dayjs(value.date);
        if (valueDate.isBefore(targetDate) || valueDate.isSame(targetDate, 'day')) {
            startValue = value;
            break;
        }
    }

    if (startValue === null) {
        throw new Error("No data point found for the specified lookback period.");
    }

    // Step 4: Calculate the percent change
    const percentChange = ((mostRecentValue.value - startValue.value) / startValue.value) * 100;
    return percentChange;
};