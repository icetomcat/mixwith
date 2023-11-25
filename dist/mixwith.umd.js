(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.mixwith = {}));
}(this, (function (exports) { 'use strict';

  const _cachedApplicationRef = Symbol('_cachedApplicationRef');
  const _mixinRef = Symbol('_mixinRef');
  const _originalMixin = Symbol('_originalMixin');
  /**
   * Sets the prototype of mixin to wrapper so that properties set on mixin are
   * inherited by the wrapper.
   *
   * This is needed in order to implement @@hasInstance as a decorator function.
   */
  const wrap = (mixin, wrapper) => {
      return Object.setPrototypeOf(wrapper, mixin);
  };
  /**
   * Decorates mixin so that it caches its applications. When applied multiple
   * times to the same superclass, mixin will only create one subclass and
   * memoize it.
   */
  const Cached = (mixin) => wrap(mixin, function (superclass) {
      // Get or create a symbol used to look up a previous application of mixin
      // to the class. This symbol is unique per mixin definition, so a class will have N
      // applicationRefs if it has had N mixins applied to it. A mixin will have
      // exactly one _cachedApplicationRef used to store its applications.
      let applicationRef = mixin[_cachedApplicationRef];
      if (!applicationRef) {
          applicationRef = mixin[_cachedApplicationRef] = Symbol(mixin.name);
      }
      // Look up an existing application of `mixin` to `c`, return it if found.
      if (Object.hasOwn(superclass, applicationRef)) {
          return superclass[applicationRef];
      }
      // Apply the mixin
      const application = mixin(superclass);
      // Cache the mixin application on the superclass
      Object.defineProperty(superclass, applicationRef, { value: application });
      return application;
  });
  /**
   * Returns `true` if `o` has an application of `mixin` on its prototype chain.
   *
   * @example
   * hasMixin(superclass.prototype, mixin)
   */
  const hasMixin = (o, mixin) => {
      while (o != null) {
          if (o[_mixinRef] === mixin[_originalMixin]) {
              return true;
          }
          o = Object.getPrototypeOf(o);
      }
      return false;
  };
  /**
   * Adds @@hasInstance (ES2015 instanceof support) to mixin.
   * Note: @@hasInstance is not supported in any browsers yet.
   */
  const HasInstance = (mixin) => {
      if (!Object.hasOwn(mixin[_originalMixin], Symbol.hasInstance)) {
          Object.defineProperty(mixin[_originalMixin], Symbol.hasInstance, {
              value: function (o) {
                  return hasMixin(o, mixin);
              }
          });
      }
      return mixin;
  };
  /**
   * Decorates `mixin` so that it only applies if it's not already on the prototype chain.
   */
  const DeDupe = (mixin) => wrap(mixin, function (superclass) {
      return hasMixin(superclass.prototype, mixin) ? superclass : mixin(superclass);
  });
  /**
   * A basic mixin decorator that sets up a reference from mixin applications
   * to the mixin definition for use by other mixin decorators.
   */
  const BareMixin = (mixin) => wrap(mixin, function (superclass) {
      // Apply the mixin
      const application = mixin(superclass);
      // Attach a reference from mixin application to wrapped mixin for RTTI
      // mixin[@@hasInstance] should use this.
      application.prototype[_mixinRef] = mixin[_originalMixin];
      return application;
  });
  /**
   * @param {T} mixin
   */
  const Mixin = (mixin) => Cached(DeDupe(HasInstance(BareMixin(Object.assign(mixin, { [_originalMixin]: mixin })))));
  class MixinBuilder {
      constructor(superclass) {
          this.superclass = superclass;
      }
      with(...args) {
          return Array.from(args).reduce((c, m) => m(c), this.superclass);
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
  const mix = (superclass) => new MixinBuilder(superclass);

  exports.BareMixin = BareMixin;
  exports.Cached = Cached;
  exports.DeDupe = DeDupe;
  exports.HasInstance = HasInstance;
  exports.Mixin = Mixin;
  exports.MixinBuilder = MixinBuilder;
  exports._cachedApplicationRef = _cachedApplicationRef;
  exports._mixinRef = _mixinRef;
  exports._originalMixin = _originalMixin;
  exports.hasMixin = hasMixin;
  exports.mix = mix;
  exports.wrap = wrap;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=mixwith.umd.js.map
