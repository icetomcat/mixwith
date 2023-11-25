'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mix = exports.MixinBuilder = exports.Mixin = exports.BareMixin = exports.DeDupe = exports.HasInstance = exports.hasMixin = exports.Cached = exports.wrap = exports._originalMixin = exports._mixinRef = exports._cachedApplicationRef = void 0;
exports._cachedApplicationRef = Symbol('_cachedApplicationRef');
exports._mixinRef = Symbol('_mixinRef');
exports._originalMixin = Symbol('_originalMixin');
/**
 * Sets the prototype of mixin to wrapper so that properties set on mixin are
 * inherited by the wrapper.
 *
 * This is needed in order to implement @@hasInstance as a decorator function.
 */
const wrap = (mixin, wrapper) => {
    return Object.setPrototypeOf(wrapper, mixin);
};
exports.wrap = wrap;
/**
 * Decorates mixin so that it caches its applications. When applied multiple
 * times to the same superclass, mixin will only create one subclass and
 * memoize it.
 */
const Cached = (mixin) => (0, exports.wrap)(mixin, function (superclass) {
    // Get or create a symbol used to look up a previous application of mixin
    // to the class. This symbol is unique per mixin definition, so a class will have N
    // applicationRefs if it has had N mixins applied to it. A mixin will have
    // exactly one _cachedApplicationRef used to store its applications.
    let applicationRef = mixin[exports._cachedApplicationRef];
    if (!applicationRef) {
        applicationRef = mixin[exports._cachedApplicationRef] = Symbol(mixin.name);
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
exports.Cached = Cached;
/**
 * Returns `true` if `o` has an application of `mixin` on its prototype chain.
 *
 * @example
 * hasMixin(superclass.prototype, mixin)
 */
const hasMixin = (o, mixin) => {
    while (o != null) {
        if (o[exports._mixinRef] === mixin[exports._originalMixin]) {
            return true;
        }
        o = Object.getPrototypeOf(o);
    }
    return false;
};
exports.hasMixin = hasMixin;
/**
 * Adds @@hasInstance (ES2015 instanceof support) to mixin.
 * Note: @@hasInstance is not supported in any browsers yet.
 */
const HasInstance = (mixin) => {
    if (!Object.hasOwn(mixin[exports._originalMixin], Symbol.hasInstance)) {
        Object.defineProperty(mixin[exports._originalMixin], Symbol.hasInstance, {
            value: function (o) {
                return (0, exports.hasMixin)(o, mixin);
            }
        });
    }
    return mixin;
};
exports.HasInstance = HasInstance;
/**
 * Decorates `mixin` so that it only applies if it's not already on the prototype chain.
 */
const DeDupe = (mixin) => (0, exports.wrap)(mixin, function (superclass) {
    return (0, exports.hasMixin)(superclass.prototype, mixin) ? superclass : mixin(superclass);
});
exports.DeDupe = DeDupe;
/**
 * A basic mixin decorator that sets up a reference from mixin applications
 * to the mixin definition for use by other mixin decorators.
 */
const BareMixin = (mixin) => (0, exports.wrap)(mixin, function (superclass) {
    // Apply the mixin
    const application = mixin(superclass);
    // Attach a reference from mixin application to wrapped mixin for RTTI
    // mixin[@@hasInstance] should use this.
    application.prototype[exports._mixinRef] = mixin[exports._originalMixin];
    return application;
});
exports.BareMixin = BareMixin;
/**
 * @param {T} mixin
 */
const Mixin = (mixin) => (0, exports.Cached)((0, exports.DeDupe)((0, exports.HasInstance)((0, exports.BareMixin)(Object.assign(mixin, { [exports._originalMixin]: mixin })))));
exports.Mixin = Mixin;
class MixinBuilder {
    constructor(superclass) {
        this.superclass = superclass;
    }
    with(...args) {
        return Array.from(args).reduce((c, m) => m(c), this.superclass);
    }
}
exports.MixinBuilder = MixinBuilder;
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
exports.mix = mix;
//# sourceMappingURL=mixwith.js.map