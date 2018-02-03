import * as debug from 'debug';
import { IServiceProvider } from './IServiceProvider';

const log = debug('@dadoc/core:container');

/**
 * Container
 */
export class Container {
  public static ref(ref: any) {
    return { $get: ref };
  }

  protected services: Map<any, any>;

  constructor(parent?: Container | Map<any, any>) {
    if (parent) {
      if (parent instanceof Map) {
        this.services = new Map(parent);
      } else if (parent instanceof Container) {
        this.services = new Map(parent.services);
      } else {
        throw new Error('Invalid parent object for Container constructor');
      }
    } else {
      this.services = new Map();
    }
    this.register({ provide: Container, useValue: this }, '$');
  }

  public register(service: IServiceProvider | any, name: string = null): Container {
    if (!service) throw new Error('Service is undefined (missing class import/export ?)');

    let definition: IServiceProvider;
    if (service.provide || service.useFactory || service.useValue) {
      definition = service;
    } else {
      definition = { provide: service };
    }
    if (name) definition.name = name;

    if (!definition.provide && !definition.name)
      throw new Error('Service need a class or name for reference');

    if (definition.provide) this.services.set(definition.provide, definition);

    if (definition.name) this.services.set(definition.name, definition);

    const serviceName: string = definition.provide ? definition.provide.name : definition.name;
    log(`[Service] "${serviceName || definition}"`);
    return this;
  }

  public has(service: string | any): boolean {
    return this.services.get(service) !== undefined;
  }

  public get(service: string | any): any {
    if (typeof service !== 'string' && !this.services.get(service)) {
      this.register(service);
    }

    const definition: IServiceProvider = this.services.get(service);

    if (!definition) throw new Error(`${service.name || service} service not defined on container`);

    if (definition.useValue !== undefined) return definition.useValue;

    if (definition.useExisting) {
      definition.useValue = this.get(definition.useExisting);
    } else if (definition.useFactory) {
      if (!definition.deps) definition.deps = [];
      definition.useValue = definition.useFactory(...definition.deps.map(item => this.get(item)));
    } else if (definition.provide) {
      definition.useValue = new definition.provide(...this.getArgs(definition.provide));

      if (definition.provide.$injects) this.getInjects(definition.provide, definition.useValue);
    }

    return definition.useValue;
  }

  private getArgs(type, parents = []): any[] {
    const args: any[] = [];
    const deps: any[] = type.$dependencies || [];

    if (parents.length > 1 && parents[0] === type) {
      // tslint:disable-next-line:no-shadowed-variable
      const parentsPath: string = parents.map(type => type.name).join(' -> ');
      throw new Error(`Circular dependency in constructor found : ${parentsPath}`);
    }

    parents.push(type);

    deps.forEach((dep: any) => {
      let dependency = dep;
      if (typeof dep === 'object' && typeof dep.$get === 'function') {
        dependency = dep.$get();
      }
      this.getArgs(dependency, parents);
      args.push(this.get(dependency));
    });

    return args;
  }

  private getInjects(target, instance): void {
    for (const name in target.$injects) {
      if (target.$injects[name]) instance[name] = this.get(target.$injects[name]);
    }
  }
}
