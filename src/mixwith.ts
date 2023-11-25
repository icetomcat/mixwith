'use strict'

export type Function<A = any> = (...args: any[]) => A
export type Constructor<A = {}> = new (...args: any[]) => A
export type MixinType<T extends Function> = InstanceType<ReturnType<T>>
export type MixinParameters<T extends (...args: any) => any> = T extends (superclass: any, ...args: infer P) => any ? P : never

export type MixWith<T extends Constructor, U extends Function[]> = U extends [infer A extends Function, ...infer B extends Function[]]
  ? T & MixWith<ReturnType<A>, B>
  : T

export const _cachedApplicationRef = Symbol('_cachedApplicationRef')
export const _mixinRef = Symbol('_mixinRef')
export const _originalMixin = Symbol('_originalMixin')

type WithOriginal = Function & { [_originalMixin]: Function }

/**
 * Sets the prototype of mixin to wrapper so that properties set on mixin are
 * inherited by the wrapper.
 *
 * This is needed in order to implement @@hasInstance as a decorator function.
 */
export const wrap = <T extends WithOriginal>(mixin: T, wrapper: Function): T => {
  return Object.setPrototypeOf(wrapper, mixin)
}

/**
 * Decorates mixin so that it caches its applications. When applied multiple
 * times to the same superclass, mixin will only create one subclass and
 * memoize it.
 */
export const Cached = <TMixin extends WithOriginal, TSuperclass extends Constructor>(
  mixin: TMixin & { [_cachedApplicationRef]?: keyof TSuperclass }
): TMixin =>
  wrap(mixin, function (superclass: TSuperclass) {
    // Get or create a symbol used to look up a previous application of mixin
    // to the class. This symbol is unique per mixin definition, so a class will have N
    // applicationRefs if it has had N mixins applied to it. A mixin will have
    // exactly one _cachedApplicationRef used to store its applications.
    let applicationRef = mixin[_cachedApplicationRef]
    if (!applicationRef) {
      applicationRef = mixin[_cachedApplicationRef] = Symbol(mixin.name) as keyof TSuperclass
    }
    // Look up an existing application of `mixin` to `c`, return it if found.
    if (Object.hasOwn(superclass, applicationRef)) {
      return superclass[applicationRef] as Constructor
    }
    // Apply the mixin
    const application: Constructor = mixin(superclass)
    // Cache the mixin application on the superclass
    Object.defineProperty(superclass, applicationRef, { value: application })
    return application
  })

/**
 * Returns `true` if `o` has an application of `mixin` on its prototype chain.
 *
 * @example
 * hasMixin(superclass.prototype, mixin)
 */
export const hasMixin = <T extends WithOriginal>(o: any, mixin: T): boolean => {
  while (o != null) {
    if (o[_mixinRef] === mixin[_originalMixin]) {
      return true
    }
    o = Object.getPrototypeOf(o)
  }
  return false
}

/**
 * Adds @@hasInstance (ES2015 instanceof support) to mixin.
 * Note: @@hasInstance is not supported in any browsers yet.
 */
export const HasInstance = <T extends WithOriginal>(mixin: T): T => {
  if (!Object.hasOwn(mixin[_originalMixin], Symbol.hasInstance)) {
    Object.defineProperty(mixin[_originalMixin], Symbol.hasInstance, {
      value: function (o: unknown) {
        return hasMixin(o, mixin)
      }
    })
  }
  return mixin
}

/**
 * Decorates `mixin` so that it only applies if it's not already on the prototype chain.
 */
export const DeDupe = <T extends WithOriginal>(mixin: T): T =>
  wrap(mixin, function <S extends Constructor>(superclass: S) {
    return hasMixin(superclass.prototype, mixin) ? superclass : mixin(superclass)
  })

/**
 * A basic mixin decorator that sets up a reference from mixin applications
 * to the mixin definition for use by other mixin decorators.
 */
export const BareMixin = <T extends WithOriginal>(mixin: T): T =>
  wrap(mixin, function <S extends Constructor>(superclass: S) {
    // Apply the mixin
    const application = mixin(superclass)

    // Attach a reference from mixin application to wrapped mixin for RTTI
    // mixin[@@hasInstance] should use this.
    application.prototype[_mixinRef] = (mixin as WithOriginal)[_originalMixin]
    return application
  })

/**
 * @param {T} mixin
 */
export const Mixin = <T extends Function>(mixin: T): T => Cached(DeDupe(HasInstance(BareMixin(Object.assign(mixin, {[_originalMixin]: mixin})))))

export class MixinBuilder<TSuperClass extends Constructor> {
  private readonly superclass: TSuperClass

  constructor (superclass: TSuperClass) {
    this.superclass = superclass
  }

  with<A extends Function[]> (...args: A): MixWith<TSuperClass, A> {
    return Array.from(args).reduce((c, m) => m(c), this.superclass) as MixWith<TSuperClass, A>
  }
}

/**
 * 
 * @param superclass 
 * @returns 
 * @example
 * class Base {}
 * 
 * const Mixin1 = Mixin(<T extends Constructor>(superclass: T) => class extends superclass { name = "" })
 * const Mixin2 = Mixin(<T extends Constructor>(superclass: T) => class extends superclass { id = "" })
 * 
 * class MyClass extends mix(Base).with(Mixin1, Mixin2) {}
 * 
 * console.log(new MyClass()) // MyClass { name: '', id: '' }
 */
export const mix = <T extends Constructor> (superclass: T): MixinBuilder<T> => new MixinBuilder(superclass)