'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mix = exports.configure = exports.Mixin = exports.BareMixin = exports.DeDupe = exports.HasInstance = exports.hasMixin = exports.Cached = exports.wrap = exports._originalMixin = exports._mixinRef = exports._cachedApplicationRef = void 0;
exports._cachedApplicationRef = Symbol('_cachedApplicationRef');
exports._mixinRef = Symbol('_mixinRef');
exports._originalMixin = Symbol('_originalMixin');
/**
 * Sets the prototype of mixin to wrapper so that properties set on mixin are
 * inherited by the wrapper.
 *
 * This is needed in order to implement @@hasInstance as a decorator function.
 */
exports.wrap = (mixin, wrapper) => {
    Object.setPrototypeOf(wrapper, mixin);
    if (!mixin[exports._originalMixin]) {
        Object.defineProperty(mixin, exports._originalMixin, {
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
exports.Cached = (mixin) => exports.wrap(mixin, (superclass, ...args) => {
    // Get or create a symbol used to look up a previous application of mixin
    // to the class. This symbol is unique per mixin definition, so a class will have N
    // applicationRefs if it has had N mixins applied to it. A mixin will have
    // exactly one _cachedApplicationRef used to store its applications.
    let applicationRef = mixin[exports._cachedApplicationRef];
    if (!applicationRef) {
        applicationRef = mixin[exports._cachedApplicationRef] = Symbol(mixin.name);
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
exports.hasMixin = (o, mixin) => {
    while (o != null) {
        if (o[exports._mixinRef] === mixin[exports._originalMixin]) {
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
exports.HasInstance = (mixin) => {
    if (Symbol.hasInstance && !({}).hasOwnProperty.call(mixin, Symbol.hasInstance)) {
        Object.defineProperty(mixin, Symbol.hasInstance, {
            value: function (o) {
                return exports.hasMixin(o, mixin);
            },
        });
    }
    return mixin;
};
/**
 * Decorates `mixin` so that it only applies if it's not already on the prototype chain.
 */
exports.DeDupe = (mixin) => exports.wrap(mixin, (superclass, ...args) => exports.hasMixin(superclass.prototype, mixin) ? superclass : mixin(superclass, ...args));
/**
 * A basic mixin decorator that sets up a reference from mixin applications
 * to the mixin definition for use by other mixin decorators.
 */
exports.BareMixin = (mixin) => exports.wrap(mixin, (superclass, ...args) => {
    // Apply the mixin
    const application = mixin(superclass, ...args);
    // Attach a reference from mixin application to wrapped mixin for RTTI
    // mixin[@@hasInstance] should use this.
    application.prototype[exports._mixinRef] = mixin[exports._originalMixin];
    return application;
});
/**
 *
 * @param mixin
 */
exports.Mixin = (mixin) => exports.DeDupe(exports.Cached(exports.HasInstance(exports.BareMixin(mixin))));
class MixinBuilder {
    constructor(superclass) {
        this.superclass = superclass;
    }
    with(...args) {
        return Array.from(args).reduce((c, m) => m(c), this.superclass);
    }
}
exports.configure = (mixin, ...args) => exports.wrap(mixin, (superclass) => mixin(superclass, ...args));
exports.mix = (superClass) => new MixinBuilder(superClass);
//# sourceMappingURL=mixwith.js.map