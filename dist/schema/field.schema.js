"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Field = void 0;
const neck_validator_1 = require("neck-validator");
;
class Field {
    code;
    isRequired;
    isRepeatable;
    activeRsl;
    indicators;
    subfields;
    constructor(code, isRequired, isRepeatable, activeRsl, indicators = [], subfields = []) {
        this.code = code;
        this.isRequired = isRequired;
        this.isRepeatable = isRepeatable;
        this.activeRsl = activeRsl;
        this.indicators = indicators;
        this.subfields = subfields;
    }
    rules() {
        const rules = {};
        let path = this.code;
        rules[path] = (this.isRequired) ? ['required'] : [];
        if (this.isRepeatable) {
            rules[path].push('array');
            path += neck_validator_1.Validator.VALIDATOR_RULE_DELIMITER + neck_validator_1.Validator.VALIDATOR_ARRAY_DELIMITER;
        }
        this.indicators.forEach(indicator => {
            const { key, rule } = indicator.rule(path + neck_validator_1.Validator.VALIDATOR_RULE_DELIMITER);
            rules[key] = rule;
        });
        this.subfields.forEach(subfield => subfield.rule(path + neck_validator_1.Validator.VALIDATOR_RULE_DELIMITER).forEach(({ key, rule }) => rules[key] = rule));
        if (this.subfields.length === 0)
            rules[`${path}${neck_validator_1.Validator.VALIDATOR_RULE_DELIMITER}value`] = ['required', 'string'];
        return rules;
    }
    isValid(data) {
        const validationData = {};
        validationData[this.code] = data;
        return neck_validator_1.Validator.validate(this.rules(), validationData);
    }
}
exports.Field = Field;
