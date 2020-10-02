import { Constructor, Mixin, mix, configure } from '../src/mixwith'

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// <TIMESTAMP>
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

const timestamp = <T extends Constructor>(superclass: T, config = {}) => {
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

interface TimestampInterface extends Mixin<typeof TimestampMixin> {}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// <CONFIGURE>
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

const configurable = <T extends Constructor>(superclass: T, config: Record<string, any> = {}) => {
  class Configure extends superclass {
    configure (localConf: Record<string, any> = {}) {
      const combined = {...config, ...localConf}
      for (let key in combined) {
        if (Object.getOwnPropertyDescriptor(this, key) || this[key]) {
          this[key] = combined[key]
        }
      }
    }
  }
  return Configure
}

const ConfigureMixin = Mixin(configurable)

interface ConfigureInterface extends Mixin<typeof ConfigureMixin> {}

interface CommentInterface extends TimestampInterface, ConfigureInterface {}

class Comment extends mix(class {}).with(configure(ConfigureMixin, { message: 'Some comment' }), TimestampMixin) implements CommentInterface {
  constructor (public message: string = '') {
    super()
  }
}

class SuperComment extends 
  mix(Comment).with(
    configure(ConfigureMixin, { message: 'Another comment' }) // <--- It shouldn't be redefined
  ) { }

/**
 * Mixin test
 */
describe("Mixin test", () => {
  const comment = new Comment()
  comment.configure({ timestamp: 0 })

  const superComment = new SuperComment()
  superComment.configure()
  
  it("Should be instance of Comment", () => {
    expect(comment).toBeInstanceOf(Comment)
  })
  
  it("Shouldn't be instance of SuperComment", () => {
    expect(comment instanceof SuperComment).toBeFalsy()
  })

  it("Should be instance of TimestampMixin", () => {
    expect(comment).toBeInstanceOf(TimestampMixin)
  })

  it("Should be instance of ConfigureMixin", () => {
    expect(comment).toBeInstanceOf(ConfigureMixin)
  })

  it("Should be configurable mixin", () => {
    expect(comment.message).toEqual('Some comment')
    expect(comment.timestamp).toEqual(0)
  })
  
  it("Should be instance of SuperComment", () => {
    expect(superComment).toBeInstanceOf(SuperComment)
  })

  it("Should be instance of TimestampMixin", () => {
    expect(superComment).toBeInstanceOf(TimestampMixin)
  })

  it("Should be instance of ConfigureMixin", () => {
    expect(superComment).toBeInstanceOf(ConfigureMixin)
  })

  it("Should be configurable mixin", () => {
    expect(superComment.message).toEqual('Some comment')
    expect(superComment.timestamp).toBeLessThanOrEqual(Date.now())
  })

})
