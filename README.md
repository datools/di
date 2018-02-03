# @datools/di

> Simple Javscript/Typescript dependency injection system

[![Build Status](https://travis-ci.org/datools/di.svg?branch=master)](https://travis-ci.org/datools/di)

# Usage

## Create your injectable service

```ts
import { Inject } from '@datools/di';

@Inject()
export class FooService {
  public foo() {
    return 'bar';
  }
}
```

## Create your container and get your service

```ts
import { Container } from '@datools/di';
import { FooService } from './FooService';

const container: Container = new Container();

const fooService: FooService = container.get(FooService);

console.log(fooService.foo());
// 'bar'
```

## Service dependencies auto injection

```ts
import { Container, Inject } from '@datools/di';
import { FooService } from './FooService';

@Inject()
export class ChildService {
  constructor(private fooService: FooService) {}

  public baz() {
    return this.fooService.foo();
  }
}

const container: Container = new Container();
const childService: ChildService = container.get(ChildService);

console.log(childService.baz());
// 'bar'
```

# Advanced usage

## Register a service with `Container#register()` method

```ts
container.register({
  provide: FooService,
});

// Is equal to

container.register(FooService);
```

**Add a name to service:**

```ts
container.register(FooService, 'foo');

// And:

container.get('foo'); // Return FooService instance
```

**Register a value:**

```ts
const SOME_CONF = Symbol('some-conf');

container.register({
  provide: SOME_CONF,
  useValue: {
    foo: 'bar',
  },
});
```

**Register a factory:**

```ts
container.register({
  provide: FooService,
  useFactory: someValue => {
    return new FooService(someValue);
  },
  deps: ['foo'],
});
```

**Use existing service:**

```ts
container.register({
  provide: FooService,
  useExisting: AnotherService,
});
```

## `@Inject()` decorator usage

**On class, with auto resolving dependencies:** (Typescript only)

```ts
@Inject()
class MyClass {
  constructor(private service: MyService) {}
}
```

**On class, with defined dependencies:**

```ts
@Inject(MyService)
class MyClass {
  constructor(service) {}
}
```

**In constructor:**

```ts
@Inject()
class MyClass {
  constructor(private service: MyService, @Inject(SOME_CONF) private conf: any) {}
}
```

**On class properties:**

```ts
class MyClass {
  // Typescript
  @Inject() private service: MyService;

  // Javascript
  @Inject(type => MyService)
  service;
}
```

**Call a service by its name:** (Available on class, constructor & properties)

```ts
class MyClass {
  @Inject('seviceName') private service: MyService;
}
```

## Use without decorators

```ts
class MyClass {
  // Inject into properties
  static $injects = { foo: FooService };

  // Inject into constructor
  static $dependencies = [FooService];

  constructor(service) {}
}
```

# License

**MIT**: See `LICENSE` file
