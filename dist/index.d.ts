import { IMarkField } from "./interfaces";
import { Field } from "./schema/field.schema";
import { Schema } from "./schema";
import { ILocalization } from "./interfaces";
import { Validator as MarkValidator } from "./validator";
declare class Mark {
    static fields(): Field[];
    static getRequiredFields(): Field[];
    static getRepeatableFields(): Field[];
    static getActiveRslFields(): Field[];
    static field(code: string): Field | undefined;
    static validate(fields: IMarkField[]): string[];
    private static isExistsField;
    private static formatErrors;
}
export { Mark, Schema, MarkValidator, ILocalization };
