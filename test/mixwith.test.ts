import { Constructor, type MixinType, mix, _originalMixin, _mixinRef, Mixin, hasMixin } from '../src/mixwith'

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// <TIMESTAMP>
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

const timestamp = <T extends Constructor>(superclass: T) => {
  class Timestamp extends superclass {
    private _timestamp: number
    
    constructor (...args: any[]) {
      super(...args)
      this._timestamp = Date.now()
    }

    get timestamp() {
      return this._timestamp
    }

    set timestamp(timestamp: number) {
      this._timestamp = timestamp
    }
  }
  return Timestamp
}

const TimestampMixin = Mixin(timestamp)

type TimestampInterface = MixinType<typeof TimestampMixin>

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// <CONFIGURE>
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

const configurable = <T extends Constructor>(superclass: T) => {
  class Configure extends superclass {
    configure(config?: unknown) {
      if (!config) return
      if (typeof config !== 'object') throw new Error("Config must be object");
      
      Object.assign(this, config)
    }
  }
  return Configure
}

const ConfigureMixin = Mixin(configurable)

type ConfigureInterface = MixinType<typeof ConfigureMixin>

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// <COMMENT MODEL>
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

type CommentConfig = {message?: string, timestamp?: number}

type CommentInterface = TimestampInterface & ConfigureInterface & {
  configure(config: CommentConfig): void
}

class Comment extends mix(class {}).with(ConfigureMixin, TimestampMixin) implements CommentInterface {
  constructor (public message: string = '') {
    super()
  }
  configure(config: CommentConfig) {
    super.configure(config)
  }
}

/**
 * Mixin test
 */
describe("Mixin test", () => {
  const comment = new Comment()
  comment.configure({ timestamp: 0, message: 'Some comment' })
  
  it("Should be instance of Comment", () => {
    expect(comment).toBeInstanceOf(Comment)
    expect(comment instanceof Comment).toEqual(true)
  })

  it("Should be instance of TimestampMixin", () => {
    expect(comment).toBeInstanceOf(TimestampMixin)
    expect(comment instanceof TimestampMixin).toEqual(true)
  })

  it("Should be instance of ConfigureMixin", () => {
    expect(comment).toBeInstanceOf(ConfigureMixin)
    expect(comment instanceof ConfigureMixin).toEqual(true)
  })

  it("Should be configurable mixin", () => {
    expect(comment.message).toEqual('Some comment')
    expect(comment.timestamp).toEqual(0)
  })

  it("Shouldn't duplicate mixins", () => {
    class TestDup extends mix(Comment).with(TimestampMixin, TimestampMixin, TimestampMixin, TimestampMixin, TimestampMixin, TimestampMixin) {}
    let count = 0
    let prototype = TestDup.prototype
    while (prototype) {
      if (Object.getOwnPropertyDescriptor(prototype, _mixinRef)?.value === timestamp) count++
      prototype = Object.getPrototypeOf(prototype)
    }
    expect(count).toEqual(1)
  })

  it("Should cache", () => {
    class Base {}
    expect(mix(Base).with(TimestampMixin)).toEqual(mix(Base).with(TimestampMixin))
  })

  it("Should add @@hasInstance", () => {
    const TestMixin = Mixin(<T extends Constructor>(superclass: T) => class extends superclass { prop1 = '' })
    ;(new class extends mix(class {}).with(TestMixin) {}).prop1
    expect(Symbol.hasInstance in TestMixin).toEqual(true)
  })

  it("Shouldn't overload @@hasInstance", () => {
    function mixinWithHasInstance<T extends Constructor>(superclass: T) { return class extends superclass {} }
    Object.defineProperty(mixinWithHasInstance, Symbol.hasInstance, {
      value: function (value: unknown) {
        return hasMixin(value, this)
      }
    })
    const MixinWithHasInstance = Mixin(mixinWithHasInstance)
    class TestHasinstance extends mix(class {}).with(MixinWithHasInstance) {}
    expect(new TestHasinstance()).toBeInstanceOf(MixinWithHasInstance)
  })

})
