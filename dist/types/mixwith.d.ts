export type Function<A = any> = (...args: any[]) => A;
export type Constructor<A = {}> = new (...args: any[]) => A;
export type MixinType<T extends Function> = InstanceType<ReturnType<T>>;
export type MixinParameters<T extends (...args: any) => any> = T extends (superclass: any, ...args: infer P) => any ? P : never;
export type MixWith<T extends Constructor, U extends Function[]> = U extends [infer A extends Function, ...infer B extends Function[]] ? T & MixWith<ReturnType<A>, B> : T;
export declare const _cachedApplicationRef: unique symbol;
export declare const _mixinRef: unique symbol;
export declare const _originalMixin: unique symbol;
type WithOriginal = Function & {
    [_originalMixin]: Function;
};
/**
 * Sets the prototype of mixin to wrapper so that properties set on mixin are
 * inherited by the wrapper.
 *
 * This is needed in order to implement @@hasInstance as a decorator function.
 */
export declare const wrap: <T extends WithOriginal>(mixin: T, wrapper: Function) => T;
/**
 * Decorates mixin so that it caches its applications. When applied multiple
 * times to the same superclass, mixin will only create one subclass and
 * memoize it.
 */
export declare const Cached: <TMixin extends WithOriginal, TSuperclass extends Constructor<{}>>(mixin: TMixin & {
    [_cachedApplicationRef]?: keyof TSuperclass | undefined;
}) => TMixin;
/**
 * Returns `true` if `o` has an application of `mixin` on its prototype chain.
 *
 * @example
 * hasMixin(superclass.prototype, mixin)
 */
export declare const hasMixin: <T extends WithOriginal>(o: any, mixin: T) => boolean;
/**
 * Adds @@hasInstance (ES2015 instanceof support) to mixin.
 * Note: @@hasInstance is not supported in any browsers yet.
 */
export declare const HasInstance: <T extends WithOriginal>(mixin: T) => T;
/**
 * Decorates `mixin` so that it only applies if it's not already on the prototype chain.
 */
export declare const DeDupe: <T extends WithOriginal>(mixin: T) => T;
/**
 * A basic mixin decorator that sets up a reference from mixin applications
 * to the mixin definition for use by other mixin decorators.
 */
export declare const BareMixin: <T extends WithOriginal>(mixin: T) => T;
/**
 * @param {T} mixin
 */
export declare const Mixin: <T extends Function<any>>(mixin: T) => T;
export declare class MixinBuilder<TSuperClass extends Constructor> {
    private readonly superclass;
    constructor(superclass: TSuperClass);
    with<A extends Function[]>(...args: A): MixWith<TSuperClass, A>;
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
export declare const mix: <T extends Constructor<{}>>(superclass: T) => MixinBuilder<T>;
export {};
