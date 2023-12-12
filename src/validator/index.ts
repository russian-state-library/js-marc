import {readFileSync} from "fs";
import {IMarkField} from "../interfaces";
import {MarkField} from "../field.mark";

interface iSchema {
    '$schema': string,
    validators: {
        condition: object,
        validator: object,
        messages: object
    }[],
    required: object[]
};

export class Validator {

    private static instance: Validator;

    private rules: object[];

    private validators: object[];

    private alwaysRequired: object[];

    private messages: object[];

    private fields: object[];

    private errors: string[] = [];

    private currentField: object = null;

    static loadCustomRulesFromSchema(schema: string|iSchema): Validator {
        const classValidator = new Validator();

        classValidator.rules = [];
        classValidator.validators = [];
        classValidator.messages = [];

        let loadedSchema: iSchema;

        if (typeof schema === 'string') {
            loadedSchema = JSON.parse(readFileSync(<string>schema, { encoding: 'utf-8' }));
        } else {
            loadedSchema = <iSchema>schema;
        }

        classValidator.alwaysRequired = loadedSchema.required ?? [];

        loadedSchema.validators.forEach((validator: { condition: object, validator: object, messages?: object }) => {
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

        classValidator.validate(JSON.parse(JSON.stringify(Validator.instance.rules))  );

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

    static substringEqualsRegex(value: string, start: number, stop: number, regex: string) {
        const regexp = new RegExp(regex);

        if (!!start && !!stop) {
            return regexp.test(value.slice(+start - 1, +stop - 1));
        }

        return regexp.test(value);
    }

    static relations(value: string, equalsIndicators: string, equalsSubfields: string, ...args) {
        const code = value.slice(0, 3);

        const index = value.slice(4, 6);

        const fields = <IMarkField[]>args.slice(-1)[0];

        const parentIdentity = Validator.instance.currentField['code'] + `-${index}`;

        let relationFields = fields.filter((f) => f.code === code && f['6']?.startsWith(parentIdentity));

        if (relationFields.length === 0) return false;

        const relationField = relationFields[0];

        if (!relationField || !relationField['6']) return false;

        const currentField = Validator.instance.currentField;

        if (equalsSubfields === 'false' && equalsIndicators === 'false') {
            const relationFieldCode = relationField['6'].slice(0, 3);

            const relationFieldIndex = relationField['6'].slice(4, 6);

            //@ts-ignore
            if (currentField.code !== relationFieldCode || index !== relationFieldIndex)
                return false;
        }

        if (
            equalsIndicators === 'true'
            && (
                //@ts-ignore
                relationField.ind1 !== currentField.ind1 ||
                //@ts-ignore
                relationField.ind2 !== currentField.ind2
            )
        ) return false;

        if (equalsSubfields === 'true') {
            const subfields = Object.keys(currentField).filter(key => !['code', 'ind1', 'ind2'].includes(key));

            for (let i = 0; i < subfields.length; ++i) {
                if (!(subfields[i] in relationField)) {
                    return false;
                }
            }
        }

        return true;
    }

    static required(value: any): boolean {
        if (typeof value === 'string') {
            return !!value && value.trim().length > 0;
        } else {
            return !!value && !!value.length;
        }
    }

    static notRequired(value: any): boolean {
        return (typeof value === 'undefined') || (!!value && !value.length);
    }

    static notEmpty(value: any): boolean {
        return (value.length ?? 0) > 0;
    }

    static substringEquals(value: string, ...params: any) {
        if (typeof params[params.length - 1] === 'object') {
            params = params.slice(0, -1)
        } else {
            params = params[0].split(',');
        }

        const start = params[0];

        const stop = params[1];

        return params.slice(2).includes((value ?? '').slice(+start - 1, +stop - 1));
    }

    static substringNotEquals(value: string, ...params: any) {
        if (typeof params[params.length - 1] === 'object') {
            params = params.slice(0, -1)
        } else {
            params = params[0].split(',');
        }

        const start = params[0];

        const stop = params[1];

        return !params.slice(2).includes((value ?? '').slice(+start - 1, +stop - 1));
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

            fields.filter(field => {
                Validator.instance.currentField = field;

                const isValid = !this.isValidField(field, index)

                Validator.instance.currentField = null;

                return isValid;
            });
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

        condition.conditions.forEach((cond, index) => {
            if (typeof cond === 'object' && 'conditions' in cond) {
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
            const valueList = (typeof field[validatorsKey] !== 'object') ? [field[validatorsKey]] : field[validatorsKey];

            const rules = [];

            const splitRules = validators[validatorsKey].split('|');

            rules.push(splitRules.slice(1).reduce((prevRule: string, currRule: string) => {
                const splitCurrRule = currRule.split(':');

                if (splitCurrRule[0] in Validator) {
                    rules.push(prevRule);
                    prevRule = currRule;
                } else {
                    prevRule += '|' + currRule;
                }

                return prevRule
            }, splitRules[0]));

            for (let index = 0, length = rules.length; index < length; ++index) {
                let [ method, args ] = rules[index].split(':');

                args = args?.split(',') ?? [];

                valueList.forEach((value: any) => {
                    if (!Validator[method](value, ...(args), this.fields)) {
                        this.errors.push(this.formatErrorMessage(Validator.instance.messages[validatorIndex][validatorsKey], field));
                    }
                })
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