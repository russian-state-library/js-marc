import { IMarkField } from "../interfaces";
export declare class Validator {
    private static instance;
    private rules;
    private validators;
    private alwaysRequired;
    private messages;
    private fields;
    private errors;
    static loadCustomRulesFromSchema(path: string): Validator;
    static validate(fields: IMarkField[]): Validator;
    static equals(val1: any, val2: any): boolean;
    static notEquals(val1: any, val2: any): boolean;
    static whereNotIn(value: any, list: any[]): boolean;
    static whereIn(value: any, list: any[]): boolean;
    static required(value: any): boolean;
    static substringEqualsFieldSubfield(value: string, start: number, stop: number, filterFieldIndicator: string, filterFieldValue: any, subfieldKey: string, fields: object[]): boolean;
    private static parseConditionFromSchema;
    isError(): boolean;
    getErrors(): string[];
    private validate;
    private findCondition;
    private isValidField;
    private formatErrorMessage;
}
