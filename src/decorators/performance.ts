import "reflect-metadata";
import { logger } from "../services/Logger";

// const timers = new Map<string, number>();

// const timerStart = (label: string) => {
//   timers.set(label, Date.now());
// };

// const timerStop = (label: string) => {
//   const start = timers.get(label);
//   if (start) {
//     const duration = Date.now() - start;
//     logger.info('perf', `[${duration}ms] ${label}`)
//     timers.delete(label);
//   } else {
//     console.warn(`Timer '${label}' does not exist`);
//   }
// };

export function logPerformance() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const timerLabel = `${target.constructor.name}::${propertyKey}`;
      logger.profile(timerLabel);

      try {
        // Call the original method
        const result = originalMethod.apply(this, args);

        // If the result is a Promise (async function), wait for it to resolve
        if (result instanceof Promise) {
          return result
            .then((value) => {
              logger.profile(timerLabel); // Stop the timer after successful resolution
              return value;
            })
            .catch((error) => {
              logger.profile(timerLabel); // Stop the timer even if there's an error
              throw error; // Re-throw the error
            });
        }

        // For synchronous methods, just stop the timer
        logger.profile(timerLabel);
        return result;
      } catch (error) {
        logger.profile(timerLabel); // Stop the timer even if there's an error
        throw error; // Re-throw the error
      }
    };

    Reflect.defineMetadata("logPerformance", true, target, propertyKey);
    return descriptor;
  };
}
