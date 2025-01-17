import "reflect-metadata";

export function logPerformance() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const timerLabel = `${target.constructor.name}::${propertyKey}`;
      console.time(timerLabel);

      try {
        // Call the original method
        const result = originalMethod.apply(this, args);

        // If the result is a Promise (async function), wait for it to resolve
        if (result instanceof Promise) {
          return result
            .then((value) => {
              console.timeEnd(timerLabel); // Stop the timer after successful resolution
              return value;
            })
            .catch((error) => {
              console.timeEnd(timerLabel); // Stop the timer even if there's an error
              throw error; // Re-throw the error
            });
        }

        // For synchronous methods, just stop the timer
        console.timeEnd(timerLabel);
        return result;
      } catch (error) {
        console.timeEnd(timerLabel); // Stop the timer even if there's an error
        throw error; // Re-throw the error
      }
    };

    Reflect.defineMetadata("logPerformance", true, target, propertyKey);
    return descriptor;
  };
}
