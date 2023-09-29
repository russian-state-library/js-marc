"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Indicator = void 0;
class Indicator {
    name;
    codes;
    constructor(name, codes) {
        this.name = name;
        this.codes = codes;
    }
    rule(path = '') {
        return { key: path + this.name, rule: ['required', `enums:${this.codes.join(',')}`, 'string'] };
    }
}
exports.Indicator = Indicator;
