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

    static field(code: string): Field|undefined {
        return Schema.field(code);
    }

    static validate(fields: IMarkField[]) {
        const validationFields = Mark.getRequiredFields();
        
        const validationData: MarkField[] = [];

        let errors = {};

        for (let i = 0, length = fields.length; i < length; ++i) {
          if (Mark.isExistsField(fields[i].code)) {
            const markField = Mark.field(fields[i].code);

            if (!validationFields.includes(markField)) validationFields.push(markField);

            validationData.push(new MarkField(fields[i].code, fields[i].ind1, fields[i].ind2, fields[i].subfields, fields[i].value));
          }
        }

        validationFields.forEach((validationField: Field) => {
            let needFields = validationData.filter((field: MarkField): boolean => field.code === validationField.code).map((field: MarkField): object => field.toValidatorStructure());

            if (needFields.length === 0) needFields = undefined;

            const validator = validationField.isValid(
              (!validationField.isRepeatable && needFields?.length === 1) ? needFields[0] : needFields
            );

            errors = {...errors, ...validator.errors};
        });

        return Mark.formatErrors(errors);
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