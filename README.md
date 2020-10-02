# TypeScript Mixin library

## Example

```typescript
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

const comment = new Comment()

if (comment instanceof ConfigureMixin) {
  comment.configure({ timestamp: 0 })
}

if (comment instanceof TimestampMixin) {
  console.log(comment.timestamp)
}
```

## Install the dependencies
```bash
npm install
```

## Start the app in development mode
```bash
npm start
```

## Run tests
```bash
npm t
```

## Run tests in watch mode
```bash
npm run test:watch
```

## Generate bundles and typings, create docs
```bash
npm run build
```

## Commit using conventional commit style (husky will tell you to use it if you haven't wink)
```bash
npm run commit
```
