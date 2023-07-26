import {readFileSync} from "fs";
import {IMarkField} from "../interfaces";
import {MarkField} from "../field.mark";

export class Validator {

    private static instance: Validator;

    private rules: object[];

    private validators: object[];

    private alwaysRequired: object[];

    private messages: object[];

    private fields: object[];

    private errors: string[] = [];

    static loadCustomRulesFromSchema(path: string): Validator {
        const classValidator = new Validator();

        classValidator.rules = [];
        classValidator.validators = [];
        classValidator.messages = [];

        const schema: {
            '$schema': string,
            validators: {
                condition: object
            }[],
            required: object[]
        } = JSON.parse(readFileSync(path, { encoding: 'utf-8' }));

        classValidator.alwaysRequired = schema.required ?? [];

        schema.validators.forEach((validator: { condition: object, validator: object, messages?: object }) => {
            classValidator.rules.push(this.parseConditionFromSchema(validator.condition));
            classValidator.validators.push(validator.validator);
            classValidator.messages.push(validator.messages);
        })

        return Validator.instance = classValidator;
    }

    static validate(fields: IMarkField[]): Validator {
        const classValidator = new Validator();

        classValidator.fields = fields.map(field => (
            (new MarkField(field.code, field.ind1, field.ind2, field.subfields, field.value)).toValidatorStructure()
        ));

        classValidator.validate(Validator.instance.rules);

        return classValidator;
    }

    static equals(val1: any, val2: any): boolean {
        return val1 === val2;
    }

    static notEquals(val1: any, val2: any): boolean {
        return val1 !== val2;
    }

    static whereNotIn(value: any, list: any[]): boolean {
        return !list.includes(value);
    }

    static whereIn(value: any, list: any[]): boolean {
        return list.includes(value);
    }

    static required(value: any): boolean {
        return value !== undefined;
    }

    static substringEqualsFieldSubfield(
        value: string,
        start: number,
        stop: number,
        filterFieldIndicator: string,
        filterFieldValue: any,
        subfieldKey: string,
        fields: object[]
    ): boolean {
        const substring = (value ?? '').substring(start - 1, stop);

        const filteredFields = fields.filter(field => field[filterFieldIndicator] === filterFieldValue);

        if (filteredFields.length === 0) return false;

        if (!(subfieldKey in filteredFields[0])) return false;

        return (Array.isArray(filteredFields[0][subfieldKey]))
            ? filteredFields[0][subfieldKey][0] === substring
            : filteredFields[0][subfieldKey] === substring;
    }

    private static parseConditionFromSchema(condition: object, type = 'and', dataField = null) {
        const conditions = { type, conditions: [] };

        for (const conditionKey in condition) {
            if (['and', 'or'].includes(conditionKey.toLowerCase())) {
                conditions.conditions.push(
                    this.parseConditionFromSchema(
                        condition[conditionKey],
                        conditionKey.toLowerCase(),
                        dataField
                    )
                );
                continue;
            }

            const conditionType = typeof condition[conditionKey];

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
    }

    public isError(): boolean {
        return this.errors.length > 0;
    }

    public getErrors(): string[] {
        return this.errors;
    }

    private validate(rules) {
        rules.forEach((rule, index) => {
            const fields = this.findCondition(rule, this.fields);

            fields.filter(field => !this.isValidField(field, index));
        });

        const alwaysRequired = Validator.instance.alwaysRequired;

        alwaysRequired.forEach(alwaysRequiredRule => {
            const fields = this.fields.filter(field => {
                const isValid = Object.keys(alwaysRequiredRule).map(rule => {
                    if (rule === 'subfields')
                        return !alwaysRequiredRule['subfields'].map(subfield => field[subfield] !== undefined).includes(false);

                    return field[rule] === alwaysRequiredRule[rule];
                });

                return !isValid.includes(false);
            });

            if (fields.length === 0) {
                let message = `Не передано обязательное поле ${alwaysRequiredRule['code']}`;

                if ('ind1' in alwaysRequiredRule) {
                    message += ', первый индикатор';
                }

                if ('ind2' in alwaysRequiredRule) {
                    message += ', второй индикатор';
                }

                if ('subfields' in alwaysRequiredRule) {
                    message += ', подполя: ' + (<Array<string>>alwaysRequiredRule['subfields']).map(subfield => `$${subfield}`);
                }

                this.errors.push(message);
            }
        })
    }

    private findCondition(condition: { type: string, conditions: any[] }, fields: object[]) {
        const type = condition.type;

        let copyFields = Array.from(fields);

        condition.conditions.filter((cond, index) => {
            if ('conditions' in cond) {
                copyFields = this.findCondition(cond, copyFields);
                condition.conditions[index] = copyFields.length > 0;
            }
        });

        copyFields = copyFields.filter(copyField => {
            const validationList = condition.conditions.map(condition => {
                return (typeof condition === "boolean")
                    ? condition
                    : Validator[condition.method](copyField[condition.dataField], condition.args);
            });

            return (type === 'and')
                ? validationList.filter(validationResult => !validationResult).length === 0
                : validationList.includes(true)
        })

        return copyFields;
    }

    private isValidField(field, validatorIndex: number): boolean {
        const validators = Validator.instance.validators[validatorIndex];

        for (const validatorsKey in validators) {
            const value = field[validatorsKey];

            const rules = validators[validatorsKey].split('|');

            for (let index = 0, length = rules.length; index < length; ++index) {
                let [ method, args ] = rules[index].split(':');

                args = args?.split(',');

                if (!Validator[method](value, ...(args ?? []), this.fields)) {
                    this.errors.push(this.formatErrorMessage(Validator.instance.messages[validatorIndex][validatorsKey], field));
                }
            }
        }

        return false;
    }

    private formatErrorMessage(message: string, field: IMarkField): string {
        for (const fieldKey in field) {
            message = message.replaceAll(`%${fieldKey}%`, field[fieldKey]);
        }
        return message;
    }

}