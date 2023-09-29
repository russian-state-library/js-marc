"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subfield = void 0;
const neck_validator_1 = require("neck-validator");
class Subfield {
    code;
    isRequired;
    isRepeatable;
    constructor(code, isRequired, isRepeatable) {
        this.code = code;
        this.isRequired = isRequired;
        this.isRepeatable = isRepeatable;
    }
    rule(path = '') {
        const rules = [];
        let suffix = '';
        if (this.isRepeatable) {
            rules.push({ key: path + this.code, rule: ['required', 'array'] });
            suffix = neck_validator_1.Validator.VALIDATOR_RULE_DELIMITER + neck_validator_1.Validator.VALIDATOR_ARRAY_DELIMITER;
        }
        rules.push({
            key: path + this.code + suffix,
            rule: (this.isRequired) ? ['required', 'string'] : []
        });
        return rules;
    }
}
exports.Subfield = Subfield;
