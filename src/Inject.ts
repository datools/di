import 'reflect-metadata';

/**
 *
 * @decorator
 * @param serviceClass
 */
// tslint:disable-next-line
export function Inject(...args: any[]): Function {
  return (prototype: any, propertyKey: string, descriptor: any): any => {
    const target: any = propertyKey ? prototype.constructor : prototype;
    const params: any[] = Reflect.getMetadata('design:paramtypes', target) || [];

    // Constructor argument
    if (descriptor !== undefined) {
      const index: number = descriptor;

      if (!target.$dependencies) target.$dependencies = [];

      target.$dependencies[index] = args[0] || params[index];

      // On property
    } else if (propertyKey) {
      if (!target.$injects) target.$injects = {};

      target.$injects[propertyKey] =
        args[0] || Reflect.getMetadata('design:type', prototype, propertyKey);

      // On class
    } else {
      if (!target.$dependencies) target.$dependencies = [];

      const ctorArgs = args.length ? args : params;
      for (const index in ctorArgs) {
        if (!target.$dependencies[index]) target.$dependencies[index] = ctorArgs[index];
      }
    }
  };
}
