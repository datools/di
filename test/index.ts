/* tslint:disable */
import * as assert from 'assert';
import { Container, Inject } from '../src';

/**
 * Base service
 */
class ServiceA {
  count = 0;

  test() {
    this.count++;
    return 'serviceA';
  }
}

/**
 * Service to check dependencies resolve
 */
@Inject()
class ServiceB {
  constructor(public serviceA: ServiceA) {}

  test() {
    return 'serviceB';
  }
}

/**
 * Service with members dependencies
 */
class ServiceMembers {
  @Inject() public serviceA: ServiceA;

  @Inject() public serviceB: ServiceB;
}

/**
 * Service to test existing
 */
class ServiceExisting {}

/**
 * Service with inject in constructor
 */
class ServiceInjectCtor {
  constructor(@Inject('serviceA') public serviceA) {}
}

/**
 * Services to check circular dependencies error
 */
@Inject(Container.ref(() => CircularB))
class CircularA {}

@Inject(Container.ref(() => CircularA))
class CircularB {}

/**
 * Service to check factory
 */
class FactoryService {
  private service: ServiceA;
  private isTrue: boolean;

  constructor(service, isTrue) {
    this.service = service;
    this.isTrue = isTrue;
  }
}

const factory: any = service => {
  return new FactoryService(service, true);
};

/**
 * Test container
 */
const container = new Container();

/**
 * Add factory
 */
container.register(
  {
    useFactory: factory,
    deps: [ServiceA],
  },
  'factory',
);

/**
 * Variable to check value
 */
const value = 'foo';
container.register(
  {
    useValue: value,
  },
  'value',
);

/**
 * Use Symbol
 */
const SYMBOL_SERVICE = Symbol();
container.register({
  provide: SYMBOL_SERVICE,
  useValue: 'symbol-value',
});

/**
 * Existing test
 */
container.register({
  provide: ServiceExisting,
  useExisting: ServiceA,
});

describe('Container', function() {
  it('register a service with name', function() {
    container.register(ServiceA, 'serviceA');

    const def = (container as any).services.get(ServiceA);
    const defByName = (container as any).services.get('serviceA');

    assert.deepEqual(def, { provide: ServiceA, name: 'serviceA' });
    assert.deepEqual(defByName, { provide: ServiceA, name: 'serviceA' });
  });

  it('return instanciated service', function() {
    const service = container.get(ServiceA);
    assert.equal(service.test(), 'serviceA');
  });

  it('return a singleton', function() {
    const service = container.get(ServiceA);
    assert.equal(service.count, 1);
  });

  it('return existing service', function() {
    const service = container.get(ServiceExisting);
    assert.equal(service.count, 1);
  });

  it('return a factory', function() {
    const service = container.get('factory');
    assert.equal(service.isTrue, true);
    assert.equal(service.service.test(), 'serviceA');
  });

  it('return a value', function() {
    const value = container.get('value');
    assert.equal(value, 'foo');
  });

  it('return a value with Symbol', function() {
    const value = container.get(SYMBOL_SERVICE);
    assert.equal(value, 'symbol-value');
  });

  it('return itself', function() {
    const service = container.get(Container);
    assert.equal(service.services instanceof Map, true);
  });

  it('resolve dependencies correctly on contructor', function() {
    const service = container.get(ServiceB);
    assert.equal(service.serviceA.test(), 'serviceA');
  });

  it('resolve dependencies correctly on members', function() {
    const service = container.get(ServiceMembers);
    assert.equal(service.serviceA.test(), 'serviceA');
    assert.equal(service.serviceB.test(), 'serviceB');
  });

  it('resolve dependencies with Inject in constructor', function() {
    const service = container.get(ServiceInjectCtor);
    assert.equal(service.serviceA.test(), 'serviceA');
  });

  it('detect circular dependencies on constructor', function() {
    assert.throws(() => {
      const service = container.get(CircularA);
    }, /Circular dependency in constructor found/);
  });

  it('can create child container', function() {
    const child = new Container(container);
    const service = child.get(ServiceA);

    assert.equal(child !== container, true);
    assert.equal(service.count > 0, true);
  });
});
