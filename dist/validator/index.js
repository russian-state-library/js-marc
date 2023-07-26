"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
var fs_1 = require("fs");
var field_mark_1 = require("../field.mark");
var Validator = /** @class */ (function () {
    function Validator() {
        this.errors = [];
    }
    Validator.loadCustomRulesFromSchema = function (path) {
        var _this = this;
        var classValidator = new Validator();
        classValidator.rules = [];
        classValidator.validators = [];
        classValidator.messages = [];
        var schema = JSON.parse((0, fs_1.readFileSync)(path, { encoding: 'utf-8' }));
        schema.validators.forEach(function (validator) {
            classValidator.rules.push(_this.parseConditionFromSchema(validator.condition));
            classValidator.validators.push(validator.validator);
            classValidator.messages.push(validator.messages);
        });
        return Validator.instance = classValidator;
    };
    Validator.validate = function (fields) {
        var classValidator = new Validator();
        classValidator.fields = fields.map(function (field) { return ((new field_mark_1.MarkField(field.code, field.ind1, field.ind2, field.subfields, field.value)).toValidatorStructure()); });
        classValidator.validate(Validator.instance.rules);
        return classValidator;
    };
    Validator.equals = function (val1, val2) {
        return val1 === val2;
    };
    Validator.notEquals = function (val1, val2) {
        return val1 !== val2;
    };
    Validator.whereNotIn = function (value, list) {
        return !list.includes(value);
    };
    Validator.whereIn = function (value, list) {
        return list.includes(value);
    };
    Validator.required = function (value) {
        return value !== undefined;
    };
    Validator.substringEqualsFieldSubfield = function (value, start, stop, filterFieldIndicator, filterFieldValue, subfieldKey, fields) {
        var substring = (value !== null && value !== void 0 ? value : '').substring(start - 1, stop);
        var filteredFields = fields.filter(function (field) { return field[filterFieldIndicator] === filterFieldValue; });
        if (filteredFields.length === 0)
            return false;
        if (!(subfieldKey in filteredFields[0]))
            return false;
        return (Array.isArray(filteredFields[0][subfieldKey]))
            ? filteredFields[0][subfieldKey][0] === substring
            : filteredFields[0][subfieldKey] === substring;
    };
    Validator.parseConditionFromSchema = function (condition, type, dataField) {
        if (type === void 0) { type = 'and'; }
        if (dataField === void 0) { dataField = null; }
        var conditions = { type: type, conditions: [] };
        for (var conditionKey in condition) {
            if (['and', 'or'].includes(conditionKey.toLowerCase())) {
                conditions.conditions.push(this.parseConditionFromSchema(condition[conditionKey], conditionKey.toLowerCase(), dataField));
                continue;
            }
            var conditionType = typeof condition[conditionKey];
            if (conditionType === 'object' && !Array.isArray(condition[conditionKey])) {
                conditions.conditions.push(this.parseConditionFromSchema(condition[conditionKey], type, conditionKey));
                continue;
            }
            conditions.conditions.push({
                dataField: (!!dataField) ? dataField : conditionKey,
                method: (!!dataField) ? conditionKey : 'equals',
                args: condition[conditionKey]
            });
        }
        return conditions;
    };
    Validator.prototype.isError = function () {
        return this.errors.length > 0;
    };
    Validator.prototype.getErrors = function () {
        return this.errors;
    };
    Validator.prototype.validate = function (rules) {
        var _this = this;
        var errors = [];
        rules.forEach(function (rule, index) {
            var fields = _this.findCondition(rule, _this.fields);
            fields.filter(function (field) { return !_this.isValidField(field, index); });
        });
        return errors;
    };
    Validator.prototype.findCondition = function (condition, fields) {
        var _this = this;
        var type = condition.type;
        var copyFields = Array.from(fields);
        condition.conditions.filter(function (cond, index) {
            if ('conditions' in cond) {
                copyFields = _this.findCondition(cond, copyFields);
                condition.conditions[index] = copyFields.length > 0;
            }
        });
        copyFields = copyFields.filter(function (copyField) {
            var validationList = condition.conditions.map(function (condition) {
                return (typeof condition === "boolean")
                    ? condition
                    : Validator[condition.method](copyField[condition.dataField], condition.args);
            });
            return (type === 'and')
                ? validationList.filter(function (validationResult) { return !validationResult; }).length === 0
                : validationList.includes(true);
        });
        return copyFields;
    };
    Validator.prototype.isValidField = function (field, validatorIndex) {
        var validators = Validator.instance.validators[validatorIndex];
        for (var validatorsKey in validators) {
            var value = field[validatorsKey];
            var rules = validators[validatorsKey].split('|');
            for (var index = 0, length_1 = rules.length; index < length_1; ++index) {
                var _a = rules[index].split(':'), method = _a[0], args = _a[1];
                args = args === null || args === void 0 ? void 0 : args.split(',');
                if (!Validator[method].apply(Validator, __spreadArray(__spreadArray([value], (args !== null && args !== void 0 ? args : []), false), [this.fields], false))) {
                    this.errors.push(this.formatErrorMessage(Validator.instance.messages[validatorIndex][validatorsKey], field));
                }
            }
        }
        return false;
    };
    Validator.prototype.formatErrorMessage = function (message, field) {
        for (var fieldKey in field) {
            message = message.replaceAll("%".concat(fieldKey, "%"), field[fieldKey]);
        }
        return message;
    };
    return Validator;
}());
exports.Validator = Validator;
