import { IMarkField } from "../interfaces";
interface iSchema {
    '$schema': string;
    validators: {
        condition: object;
        validator: object;
        messages: object;
    }[];
    required: object[];
}
export declare class Validator {
    private static instance;
    private rules;
    private validators;
    private alwaysRequired;
    private messages;
    private fields;
    private errors;
    private currentField;
    static loadCustomRulesFromSchema(schema: string | iSchema): Validator;
    static validate(fields: IMarkField[]): Validator;
    static equals(val1: any, val2: any): boolean;
    static notEquals(val1: any, val2: any): boolean;
    static whereNotIn(value: any, list: any[]): boolean;
    static whereIn(value: any, list: any[]): boolean;
    static substringEqualsRegex(value: string, start: number, stop: number, regex: string): boolean;
    static relations(value: string, equalsIndicators: string, equalsSubfields: string, ...args: any[]): boolean;
    static required(value: any): boolean;
    static notRequired(value: any): boolean;
    static notEmpty(value: any): boolean;
    static substringEquals(value: string, ...params: any): any;
    static substringNotEquals(value: string, ...params: any): boolean;
    static substringEqualsFieldSubfield(value: string, start: number, stop: number, filterFieldIndicator: string, filterFieldValue: any, subfieldKey: string, fields: object[]): boolean;
    private static parseConditionFromSchema;
    isError(): boolean;
    getErrors(): string[];
    private validate;
    private findCondition;
    private isValidField;
    private formatErrorMessage;
}
export {};
