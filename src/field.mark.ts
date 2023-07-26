import { Schema } from './schema';
import { IMarkField } from './interfaces';
import { Indicator } from './schema/indicator.schema';

export class MarkField implements IMarkField {

    constructor(
        public readonly code: string,
        public readonly ind1?: string,
        public readonly ind2?: string,
        public readonly subfields?: { code: string, value: string }[],
        public readonly value?: string
    ) {}

    toValidatorStructure(): object {
        const schemaField = Schema.field(this.code);

        const response = { code: this.code };

        schemaField?.indicators?.forEach((indicator: Indicator) => response[indicator.name] = this[indicator.name]);

        this?.subfields?.forEach((subfield) => {
            const schemaSubfield = schemaField.subfields.filter(schemaSubfield => schemaSubfield.code === subfield.code)[0];
            
            if (schemaSubfield.isRepeatable && !response[subfield.code]) {
                response[subfield.code] = [subfield.value];
            } else if (schemaSubfield.isRepeatable) {
                response[subfield.code].push(subfield.value);
            } else {
                response[subfield.code] = subfield.value;
            }
        });

        if (!!this.value) response['value'] = this.value;

        return response;
    }

}