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
exports.MarkValidator = exports.Schema = exports.Mark = void 0;
var schema_1 = require("./schema");
Object.defineProperty(exports, "Schema", { enumerable: true, get: function () { return schema_1.Schema; } });
var neck_validator_1 = require("neck-validator");
var validator_1 = require("./validator");
Object.defineProperty(exports, "MarkValidator", { enumerable: true, get: function () { return validator_1.Validator; } });
var Mark = /** @class */ (function () {
    function Mark() {
    }
    Mark.fields = function () {
        return schema_1.Schema.fields();
    };
    Mark.getRequiredFields = function () {
        return Mark.fields().filter(function (field) { return field.isRequired; });
    };
    Mark.getRepeatableFields = function () {
        return Mark.fields().filter(function (field) { return field.isRepeatable; });
    };
    Mark.getActiveRslFields = function () {
        return Mark.fields().filter(function (field) { return field.activeRsl; });
    };
    Mark.field = function (code) {
        return schema_1.Schema.field(code);
    };
    Mark.validate = function (fields) {
        var errors = fields.filter(function (field) {
            var schemaField = Mark.field(field.code);
            return !schemaField || !schemaField.activeRsl;
        }).map(function (invalidField) {
            return "\u041F\u043E\u043B\u0435 ".concat(invalidField.code, " \u043D\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0432 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0435.");
        });
        fields = fields.filter(function (field) {
            var schemaField = Mark.field(field.code);
            return !!schemaField && schemaField.activeRsl;
        });
        errors = errors.concat(validator_1.Validator.validate(fields).getErrors());
        return errors;
    };
    Mark.isExistsField = function (code) {
        return !!Mark.field(code);
    };
    Mark.formatErrors = function (errors) {
        var response = [];
        var localizateRules = function (type, rules) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            for (var i = 0, length_1 = rules.length; i < length_1; ++i) {
                response.push(schema_1.Schema.getRuleLocalization.apply(schema_1.Schema, __spreadArray(["".concat(rules[i].rule, "_").concat(type)], args, false)).trim());
            }
        };
        for (var errorKey in errors) {
            errors[errorKey] = errors[errorKey].filter(function (error) { return error.rule === 'required'; });
            var splitErrorKey = errorKey.split(neck_validator_1.Validator.VALIDATOR_RULE_DELIMITER);
            var isIndicator = splitErrorKey.includes('ind1') || splitErrorKey.includes('ind2');
            var isValue = splitErrorKey.includes('value');
            if (isIndicator) {
                localizateRules('indicator', errors[errorKey], (splitErrorKey.includes('ind1')) ? '1' : '2', splitErrorKey[0]);
            }
            else if (isValue) {
                localizateRules('value', errors[errorKey], splitErrorKey[0]);
            }
            else if (splitErrorKey.length > 1 && !isIndicator && !isValue) {
                localizateRules('subfield', errors[errorKey], splitErrorKey[splitErrorKey.length - 1], splitErrorKey[0]);
            }
            else {
                localizateRules.apply(void 0, __spreadArray(['field', errors[errorKey]], splitErrorKey.concat(errors[errorKey][0].args), false));
            }
        }
        return response;
    };
    return Mark;
}());
exports.Mark = Mark;
