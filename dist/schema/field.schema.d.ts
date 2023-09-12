import { Validator } from 'neck-validator';
import { Indicator } from './indicator.schema';
import { Subfield } from './subfield.schema';
interface IField {
    code: string;
    isRepeatable: boolean;
    isRequired: boolean;
    indicators: Indicator[];
    subfields: Subfield[];
}
export declare class Field implements IField {
    readonly code: string;
    readonly isRequired: boolean;
    readonly isRepeatable: boolean;
    readonly activeRsl: boolean;
    indicators: Indicator[];
    subfields: Subfield[];
    constructor(code: string, isRequired: boolean, isRepeatable: boolean, activeRsl: boolean, indicators?: Indicator[], subfields?: Subfield[]);
    rules(): object;
    isValid(data: any): Validator;
}
export {};
