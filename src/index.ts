import { IMarkField } from "./interfaces";
import { MarkField } from "./field.mark";
import { Field } from "./schema/field.schema";
import { Schema } from "./schema";
import { Validator } from "neck-validator";
import { ILocalization } from "./interfaces";
import { Validator as MarkValidator } from "./validator";

class Mark {

    static fields(): Field[] {
        return Schema.fields();
    }

    static getRequiredFields(): Field[] {
        return Mark.fields().filter((field: Field): boolean => field.isRequired);
    }

    static getRepeatableFields(): Field[] {
        return Mark.fields().filter((field: Field): boolean => field.isRepeatable);
    }

    static getActiveRslFields(): Field[] {
        return Mark.fields().filter((field: Field) => field.activeRsl);
    }

    static field(code: string): Field|undefined {
        return Schema.field(code);
    }

    static validate(fields: IMarkField[]) {
        let errors = fields.filter((field: IMarkField) => {
            const schemaField = Mark.field(field.code);
            return !schemaField || !schemaField.activeRsl;
        }).map(invalidField => {
            return `Поле ${invalidField.code} не используется в библиотеке.`;
        });

        fields = fields.filter((field: IMarkField) => {
            const schemaField = Mark.field(field.code);
            return !!schemaField && schemaField.activeRsl;
        });

        errors = errors.concat(MarkValidator.validate(fields).getErrors());

        return [...new Set(errors)];
    }

    private static isExistsField(code: string): boolean {
        return !!Mark.field(code);
    }

    private static formatErrors(errors) {
      const response = [];

      const localizateRules = (type: string, rules, ...args: string[]) => {
        for (let i = 0, length = rules.length; i < length; ++i) {
          response.push(Schema.getRuleLocalization(`${rules[i].rule}_${type}`, ...args).trim())
        }
      }
      
      for (const errorKey in errors) {
        errors[errorKey] = errors[errorKey].filter(error => error.rule === 'required');

        const splitErrorKey = errorKey.split(Validator.VALIDATOR_RULE_DELIMITER);

        const isIndicator = splitErrorKey.includes('ind1') || splitErrorKey.includes('ind2');

        const isValue = splitErrorKey.includes('value');

        if (isIndicator) {
          localizateRules('indicator', errors[errorKey], (splitErrorKey.includes('ind1')) ? '1' : '2', splitErrorKey[0]);
        } else if (isValue) {
          localizateRules('value', errors[errorKey], splitErrorKey[0]); 
        } else if (splitErrorKey.length > 1 && !isIndicator && !isValue) {
          localizateRules('subfield', errors[errorKey], splitErrorKey[splitErrorKey.length - 1], splitErrorKey[0]);
        } else {
          localizateRules('field', errors[errorKey], ...splitErrorKey.concat(errors[errorKey][0].args)); 
        }
      }

      return response;
    }

}

export { Mark, Schema, MarkValidator, ILocalization };