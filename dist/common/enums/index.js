(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ComponentNameEnum = void 0;
    // Define the Enum for component names
    var ComponentNameEnum;
    (function (ComponentNameEnum) {
        ComponentNameEnum["DOC_UTILITY"] = "DOC_UTILITY";
        ComponentNameEnum["ON_BOARDING"] = "ON_BOARDING";
    })(ComponentNameEnum || (exports.ComponentNameEnum = ComponentNameEnum = {}));
    ;
});
