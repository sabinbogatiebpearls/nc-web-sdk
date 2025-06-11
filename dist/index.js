"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentNameEnum = exports.loadAndInitialize = void 0;
var index_1 = __importDefault(require("./core/index"));
exports.loadAndInitialize = index_1.default;
var index_2 = require("./common/enums/index");
Object.defineProperty(exports, "ComponentNameEnum", { enumerable: true, get: function () { return index_2.ComponentNameEnum; } });
