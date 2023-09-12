"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Field = void 0;
var neck_validator_1 = require("neck-validator");
;
var Field = /** @class */ (function () {
    function Field(code, isRequired, isRepeatable, activeRsl, indicators, subfields) {
        if (indicators === void 0) { indicators = []; }
        if (subfields === void 0) { subfields = []; }
        this.code = code;
        this.isRequired = isRequired;
        this.isRepeatable = isRepeatable;
        this.activeRsl = activeRsl;
        this.indicators = indicators;
        this.subfields = subfields;
    }
    Field.prototype.rules = function () {
        var rules = {};
        var path = this.code;
        rules[path] = (this.isRequired) ? ['required'] : [];
        if (this.isRepeatable) {
            rules[path].push('array');
            path += neck_validator_1.Validator.VALIDATOR_RULE_DELIMITER + neck_validator_1.Validator.VALIDATOR_ARRAY_DELIMITER;
        }
        this.indicators.forEach(function (indicator) {
            var _a = indicator.rule(path + neck_validator_1.Validator.VALIDATOR_RULE_DELIMITER), key = _a.key, rule = _a.rule;
            rules[key] = rule;
        });
        this.subfields.forEach(function (subfield) { return subfield.rule(path + neck_validator_1.Validator.VALIDATOR_RULE_DELIMITER).forEach(function (_a) {
            var key = _a.key, rule = _a.rule;
            return rules[key] = rule;
        }); });
        if (this.subfields.length === 0)
            rules["".concat(path).concat(neck_validator_1.Validator.VALIDATOR_RULE_DELIMITER, "value")] = ['required', 'string'];
        return rules;
    };
    Field.prototype.isValid = function (data) {
        var validationData = {};
        validationData[this.code] = data;
        return neck_validator_1.Validator.validate(this.rules(), validationData);
    };
    return Field;
}());
exports.Field = Field;
