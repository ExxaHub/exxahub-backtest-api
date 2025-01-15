import dayjs from "dayjs";

/**
 * Calculates the percent change in value over a trailing period (e.g., 1 day, 3 days, 6 days),
 * given an array of daily values.
 * 
 * @param values - An array of values (each representing a day's value, most recent value last).
 * @param daysAgo - The number of days to look back for the start of the period.
 * @returns The percent change in value over the trailing period.
 */
export const trailingPercentChange = (values: number[], lookbackValue: number, lookbackInterval: 'day' | 'month' | 'year'): number => {
    const today = dayjs()
    const daysAgo = Math.abs(today.subtract(lookbackValue, lookbackInterval).diff(today, 'day'))

    console.log('daysAgo', daysAgo, lookbackValue, lookbackInterval)

    if (values.length < 2) {
        throw new Error("At least two data points are required.");
    }

    // Ensure daysAgo is within the bounds of the available data
    if (daysAgo >= values.length) {
        throw new Error("Not enough data points to calculate the percent change for the specified period.");
    }

    // Get the start value (daysAgo days ago) and the end value (most recent value)
    const startValue = values[values.length - 1 - daysAgo];  // Value from 'daysAgo' days ago
    const endValue = values[values.length - 1];  // Most recent value

    // Calculate and return the percent change
    const percentChange = ((endValue - startValue) / startValue) * 100;
    return percentChange;
}
