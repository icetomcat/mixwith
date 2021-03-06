'use strict'

export type Function<A = any> = (...args: any[]) => A
export type Constructor<A = any> = new (...args: any[]) => A
export type Mixin<T extends Function<any>> = InstanceType<ReturnType<T>>
export type MixinParameters<T extends (...args: any) => any> = T extends (superclass: any, ...args: infer P) => any ? P : never;

export const _cachedApplicationRef = Symbol('_cachedApplicationRef')
export const _mixinRef = Symbol('_mixinRef')
export const _originalMixin = Symbol('_originalMixin')

/**
 * Sets the prototype of mixin to wrapper so that properties set on mixin are
 * inherited by the wrapper.
 *
 * This is needed in order to implement @@hasInstance as a decorator function.
 */
export const wrap = <T> (mixin: T | any, wrapper: Function<T>): any => {
  Object.setPrototypeOf(wrapper, mixin)
  if (!mixin[_originalMixin]) {
    Object.defineProperty(mixin, _originalMixin, {
      value: mixin,
    })
  }
  return wrapper
}

/**
 * Decorates mixin so that it caches its applications. When applied multiple
 * times to the same superclass, mixin will only create one subclass and
 * memoize it.
 */
export const Cached = <T> (mixin: T | any): T => wrap(mixin,
  <T extends Constructor> (superclass: T | any, ...args: any[]) => {
    // Get or create a symbol used to look up a previous application of mixin
    // to the class. This symbol is unique per mixin definition, so a class will have N
    // applicationRefs if it has had N mixins applied to it. A mixin will have
    // exactly one _cachedApplicationRef used to store its applications.
    let applicationRef = mixin[_cachedApplicationRef]
    if (!applicationRef) {
      applicationRef = mixin[_cachedApplicationRef] = Symbol(mixin.name)
    }
    // Look up an existing application of `mixin` to `c`, return it if found.
    if (({}).hasOwnProperty.call(superclass, applicationRef)) {
      return superclass[applicationRef]
    }
    // Apply the mixin
    const application: Constructor = mixin(superclass, ...args)
    // Cache the mixin application on the superclass
    superclass[applicationRef] = application
    return application
  })

/**
 * Returns `true` if `o` has an application of `mixin` on its prototype chain.
 *
 * @example
 * hasMixin(superclass.prototype, mixin)
 */
export const hasMixin = <T> (o: any, mixin: T | any): boolean => {
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
export const HasInstance = <T> (mixin: T | any): T => {
  if (Symbol.hasInstance && !({}).hasOwnProperty.call(mixin, Symbol.hasInstance)) {
    Object.defineProperty(mixin, Symbol.hasInstance, {
      value: function (o: any) {
        return hasMixin(o, mixin)
      },
    })
  }
  return mixin
}

/**
 * Decorates `mixin` so that it only applies if it's not already on the prototype chain.
 */
export const DeDupe = <T> (mixin: T | any): T => wrap(mixin,
  <S extends Constructor> (superclass: S, ...args: any[]) => hasMixin(superclass.prototype, mixin) ? superclass : mixin(superclass, ...args)
)

/**
 * A basic mixin decorator that sets up a reference from mixin applications
 * to the mixin definition for use by other mixin decorators.
 */
export const BareMixin = <T> (mixin: T | any): T => wrap(mixin,
  <T> (superclass: T, ...args: any[]) => {
    // Apply the mixin
    const application = mixin(superclass, ...args)

    // Attach a reference from mixin application to wrapped mixin for RTTI
    // mixin[@@hasInstance] should use this.
    application.prototype[_mixinRef] = mixin[_originalMixin]
    return application
  }
)

/**
 *
 * @param mixin
 */
export const Mixin = <T> (mixin: T): T => DeDupe(Cached(HasInstance(BareMixin(mixin))))

class MixinBuilder<TSuperClass extends Constructor> {
  private superclass: TSuperClass

  constructor (superclass: TSuperClass) {
    this.superclass = superclass
  }

  with (): TSuperClass;
  with<A extends Function> (m1: A): TSuperClass & ReturnType<A>;
  with<A extends Function, B extends Function> (m1: A, m2: B): TSuperClass & ReturnType<A> & ReturnType<B>;
  with<A extends Function, B extends Function, C extends Function> (m1: A, m2: B, m3: C): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C>;
  with<A extends Function, B extends Function, C extends Function, D extends Function> (m1: A, m2: B, m3: C, m4: D): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: F): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function, M extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L, m13: M): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L> & ReturnType<M>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function, M extends Function, N extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L, m13: M, m14: N): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L> & ReturnType<M> & ReturnType<N>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function, M extends Function, N extends Function, O extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L, m13: M, m14: N, m15: O): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L> & ReturnType<M> & ReturnType<N> & ReturnType<O>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function, M extends Function, N extends Function, O extends Function, P extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L, m13: M, m14: N, m15: O, m16: P): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L> & ReturnType<M> & ReturnType<N> & ReturnType<O> & ReturnType<P>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function, M extends Function, N extends Function, O extends Function, P extends Function, Q extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L, m13: M, m14: N, m15: O, m16: P, m17: Q): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L> & ReturnType<M> & ReturnType<N> & ReturnType<O> & ReturnType<P> & ReturnType<Q>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function, M extends Function, N extends Function, O extends Function, P extends Function, Q extends Function, R extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L, m13: M, m14: N, m15: O, m16: P, m17: Q, m18: R): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L> & ReturnType<M> & ReturnType<N> & ReturnType<O> & ReturnType<P> & ReturnType<Q> & ReturnType<R>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function, M extends Function, N extends Function, O extends Function, P extends Function, Q extends Function, R extends Function, S extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L, m13: M, m14: N, m15: O, m16: P, m17: Q, m18: R, m19: S): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L> & ReturnType<M> & ReturnType<N> & ReturnType<O> & ReturnType<P> & ReturnType<Q> & ReturnType<R> & ReturnType<S>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function, M extends Function, N extends Function, O extends Function, P extends Function, Q extends Function, R extends Function, S extends Function, T extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L, m13: M, m14: N, m15: O, m16: P, m17: Q, m18: R, m19: S, m20: T): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L> & ReturnType<M> & ReturnType<N> & ReturnType<O> & ReturnType<P> & ReturnType<Q> & ReturnType<R> & ReturnType<S> & ReturnType<T>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function, M extends Function, N extends Function, O extends Function, P extends Function, Q extends Function, R extends Function, S extends Function, T extends Function, U extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L, m13: M, m14: N, m15: O, m16: P, m17: Q, m18: R, m19: S, m20: T, m21: U): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L> & ReturnType<M> & ReturnType<N> & ReturnType<O> & ReturnType<P> & ReturnType<Q> & ReturnType<R> & ReturnType<S> & ReturnType<T> & ReturnType<U>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function, M extends Function, N extends Function, O extends Function, P extends Function, Q extends Function, R extends Function, S extends Function, T extends Function, U extends Function, V extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L, m13: M, m14: N, m15: O, m16: P, m17: Q, m18: R, m19: S, m20: T, m21: U, m22: V): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L> & ReturnType<M> & ReturnType<N> & ReturnType<O> & ReturnType<P> & ReturnType<Q> & ReturnType<R> & ReturnType<S> & ReturnType<T> & ReturnType<U> & ReturnType<V>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function, M extends Function, N extends Function, O extends Function, P extends Function, Q extends Function, R extends Function, S extends Function, T extends Function, U extends Function, V extends Function, W extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L, m13: M, m14: N, m15: O, m16: P, m17: Q, m18: R, m19: S, m20: T, m21: U, m22: V, m23: W): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L> & ReturnType<M> & ReturnType<N> & ReturnType<O> & ReturnType<P> & ReturnType<Q> & ReturnType<R> & ReturnType<S> & ReturnType<T> & ReturnType<U> & ReturnType<V> & ReturnType<W>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function, M extends Function, N extends Function, O extends Function, P extends Function, Q extends Function, R extends Function, S extends Function, T extends Function, U extends Function, V extends Function, W extends Function, X extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L, m13: M, m14: N, m15: O, m16: P, m17: Q, m18: R, m19: S, m20: T, m21: U, m22: V, m23: W, m24: X): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L> & ReturnType<M> & ReturnType<N> & ReturnType<O> & ReturnType<P> & ReturnType<Q> & ReturnType<R> & ReturnType<S> & ReturnType<T> & ReturnType<U> & ReturnType<V> & ReturnType<W> & ReturnType<X>;
  with<A extends Function, B extends Function, C extends Function, D extends Function, E extends Function, F extends Function, G extends Function, H extends Function, I extends Function, J extends Function, K extends Function, L extends Function, M extends Function, N extends Function, O extends Function, P extends Function, Q extends Function, R extends Function, S extends Function, T extends Function, U extends Function, V extends Function, W extends Function, X extends Function, Y extends Function> (m1: A, m2: B, m3: C, m4: D, m5: E, m6: F, m7: G, m8: H, m9: I, m10: J, m11: K, m12: L, m13: M, m14: N, m15: O, m16: P, m17: Q, m18: R, m19: S, m20: T, m21: U, m22: V, m23: W, m24: X, m25: Y): TSuperClass & ReturnType<A> & ReturnType<B> & ReturnType<C> & ReturnType<D> & ReturnType<E> & ReturnType<F> & ReturnType<G> & ReturnType<H> & ReturnType<I> & ReturnType<J> & ReturnType<K> & ReturnType<L> & ReturnType<M> & ReturnType<N> & ReturnType<O> & ReturnType<P> & ReturnType<Q> & ReturnType<R> & ReturnType<S> & ReturnType<T> & ReturnType<U> & ReturnType<V> & ReturnType<W> & ReturnType<X> & ReturnType<Y>;
  with<A extends Array<Function>> (...args: A): TSuperClass {
    return Array.from(args).reduce((c, m) => m(c), this.superclass)
  }
}

export const configure = <T extends Function> (mixin: T, ...args: MixinParameters<T>): T => wrap(mixin, <T> (superclass: T) => mixin(superclass, ...args))

export const mix = <T extends Constructor> (superClass: T): MixinBuilder<T> => new MixinBuilder(superClass)
