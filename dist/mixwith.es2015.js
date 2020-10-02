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
    Object.setPrototypeOf(wrapper, mixin);
    if (!mixin[_originalMixin]) {
        Object.defineProperty(mixin, _originalMixin, {
            value: mixin,
        });
    }
    return wrapper;
};
/**
 * Decorates mixin so that it caches its applications. When applied multiple
 * times to the same superclass, mixin will only create one subclass and
 * memoize it.
 */
const Cached = (mixin) => wrap(mixin, (superclass, ...args) => {
    // Get or create a symbol used to look up a previous application of mixin
    // to the class. This symbol is unique per mixin definition, so a class will have N
    // applicationRefs if it has had N mixins applied to it. A mixin will have
    // exactly one _cachedApplicationRef used to store its applications.
    let applicationRef = mixin[_cachedApplicationRef];
    if (!applicationRef) {
        applicationRef = mixin[_cachedApplicationRef] = Symbol(mixin.name);
    }
    // Look up an existing application of `mixin` to `c`, return it if found.
    if (({}).hasOwnProperty.call(superclass, applicationRef)) {
        return superclass[applicationRef];
    }
    // Apply the mixin
    const application = mixin(superclass, ...args);
    // Cache the mixin application on the superclass
    superclass[applicationRef] = application;
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
    if (Symbol.hasInstance && !({}).hasOwnProperty.call(mixin, Symbol.hasInstance)) {
        Object.defineProperty(mixin, Symbol.hasInstance, {
            value: function (o) {
                return hasMixin(o, mixin);
            },
        });
    }
    return mixin;
};
/**
 * Decorates `mixin` so that it only applies if it's not already on the prototype chain.
 */
const DeDupe = (mixin) => wrap(mixin, (superclass, ...args) => hasMixin(superclass.prototype, mixin) ? superclass : mixin(superclass, ...args));
/**
 * A basic mixin decorator that sets up a reference from mixin applications
 * to the mixin definition for use by other mixin decorators.
 */
const BareMixin = (mixin) => wrap(mixin, (superclass, ...args) => {
    // Apply the mixin
    const application = mixin(superclass, ...args);
    // Attach a reference from mixin application to wrapped mixin for RTTI
    // mixin[@@hasInstance] should use this.
    application.prototype[_mixinRef] = mixin[_originalMixin];
    return application;
});
/**
 *
 * @param mixin
 */
const Mixin = (mixin) => DeDupe(Cached(HasInstance(BareMixin(mixin))));
class MixinBuilder {
    constructor(superclass) {
        this.superclass = superclass;
    }
    with(...args) {
        return Array.from(args).reduce((c, m) => m(c), this.superclass);
    }
}
const configure = (mixin, ...args) => wrap(mixin, (superclass) => mixin(superclass, ...args));
const mix = (superClass) => new MixinBuilder(superClass);

export { BareMixin, Cached, DeDupe, HasInstance, Mixin, _cachedApplicationRef, _mixinRef, _originalMixin, configure, hasMixin, mix, wrap };
//# sourceMappingURL=mixwith.es2015.js.map
