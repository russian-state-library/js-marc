"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkValidator = exports.Schema = exports.Mark = void 0;
const schema_1 = require("./schema");
Object.defineProperty(exports, "Schema", { enumerable: true, get: function () { return schema_1.Schema; } });
const neck_validator_1 = require("neck-validator");
const validator_1 = require("./validator");
Object.defineProperty(exports, "MarkValidator", { enumerable: true, get: function () { return validator_1.Validator; } });
class Mark {
    static fields() {
        return schema_1.Schema.fields();
    }
    static getRequiredFields() {
        return Mark.fields().filter((field) => field.isRequired);
    }
    static getRepeatableFields() {
        return Mark.fields().filter((field) => field.isRepeatable);
    }
    static getActiveRslFields() {
        return Mark.fields().filter((field) => field.activeRsl);
    }
    static field(code) {
        return schema_1.Schema.field(code);
    }
    static validate(fields) {
        let errors = fields.filter((field) => {
            const schemaField = Mark.field(field.code);
            return !schemaField || !schemaField.activeRsl;
        }).map(invalidField => {
            return `Поле ${invalidField.code} не используется в библиотеке.`;
        });
        fields = fields.filter((field) => {
            const schemaField = Mark.field(field.code);
            return !!schemaField && schemaField.activeRsl;
        });
        errors = errors.concat(validator_1.Validator.validate(fields).getErrors());
        return [...new Set(errors)];
    }
    static isExistsField(code) {
        return !!Mark.field(code);
    }
    static formatErrors(errors) {
        const response = [];
        const localizateRules = (type, rules, ...args) => {
            for (let i = 0, length = rules.length; i < length; ++i) {
                response.push(schema_1.Schema.getRuleLocalization(`${rules[i].rule}_${type}`, ...args).trim());
            }
        };
        for (const errorKey in errors) {
            errors[errorKey] = errors[errorKey].filter(error => error.rule === 'required');
            const splitErrorKey = errorKey.split(neck_validator_1.Validator.VALIDATOR_RULE_DELIMITER);
            const isIndicator = splitErrorKey.includes('ind1') || splitErrorKey.includes('ind2');
            const isValue = splitErrorKey.includes('value');
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
                localizateRules('field', errors[errorKey], ...splitErrorKey.concat(errors[errorKey][0].args));
            }
        }
        return response;
    }
}
exports.Mark = Mark;
