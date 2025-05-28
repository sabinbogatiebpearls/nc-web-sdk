var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@core/index", "@common/enums/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ComponentNameEnum = void 0;
    var index_1 = __importDefault(require("./core/index"));
    var index_2 = require("./common/enums/index");
    Object.defineProperty(exports, "ComponentNameEnum", { enumerable: true, get: function () { return index_2.ComponentNameEnum; } });
    exports.default = index_1.default;
});
