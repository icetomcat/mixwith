# TypeScript Mixin library

## Examples

### Basic usage

```typescript
class Base {}

const NameMixin = Mixin(<T extends Constructor>(superclass: T) => class extends superclass { name = "Node" })

const IdMixin = Mixin(<T extends Constructor>(superclass: T) => class extends superclass { id = nanoid() })

class MyClass extends mix(Base).with(NameMixin, IdMixin) {}

console.log(new MyClass()) // MyClass { name: 'Node', id: '2FHGySBlhFAMRwkiMiU9D' }
```

### Instance of
```typescript
if (myClass instanceof SomeMixin) doSomething()
```

### Types
```typescript
type NameMixinType = MixinType<typeof NameMixin>
type IdMixinType = MixinType<typeof IdMixin>

type UserType = NameMixinType & IdMixinType

class User extends mix(Base).with(NameMixin, IdMixin) implements UserType {}
```

## Development

### Install the dependencies
```bash
yarn install
```

### Start the app in development mode
```bash
yarn start
```

### Run tests
```bash
yarn test
```

### Run tests in watch mode
```bash
yarn test:watch
```

### Generate bundles and typings, create docs
```bash
yarn build
```
