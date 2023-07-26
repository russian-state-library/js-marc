"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var field_mark_1 = require("./field.mark");
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
    Mark.field = function (code) {
        return schema_1.Schema.field(code);
    };
    Mark.validate = function (fields) {
        var validationFields = Mark.getRequiredFields();
        var validationData = [];
        var errors = {};
        for (var i = 0, length_1 = fields.length; i < length_1; ++i) {
            if (Mark.isExistsField(fields[i].code)) {
                var markField = Mark.field(fields[i].code);
                if (!validationFields.includes(markField))
                    validationFields.push(markField);
                validationData.push(new field_mark_1.MarkField(fields[i].code, fields[i].ind1, fields[i].ind2, fields[i].subfields, fields[i].value));
            }
        }
        validationFields.forEach(function (validationField) {
            var needFields = validationData.filter(function (field) { return field.code === validationField.code; }).map(function (field) { return field.toValidatorStructure(); });
            if (needFields.length === 0)
                needFields = undefined;
            var validator = validationField.isValid((!validationField.isRepeatable && (needFields === null || needFields === void 0 ? void 0 : needFields.length) === 1) ? needFields[0] : needFields);
            errors = __assign(__assign({}, errors), validator.errors);
        });
        return Mark.formatErrors(errors);
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
            for (var i = 0, length_2 = rules.length; i < length_2; ++i) {
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
