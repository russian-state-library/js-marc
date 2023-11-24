import { readFileSync } from "fs";
import { Field } from "./field.schema";
import { Indicator } from "./indicator.schema";
import { Subfield } from "./subfield.schema";
import { ILocalization } from "../interfaces";
import { format } from "util";

export class Schema {

    private static schemaInstance: Schema;

    private codes: string[] = [];

    private fields: Field[] = [];

    private localization: ILocalization = {
        required_field: 'Не передано обязательное поле %s.',
        required_indicator: 'Не передан обязательный индикатор %s для поля %s.',
        required_subfield: 'Не передано обязательное подполе $%s для поля %s.',
        required_value: 'Не передано значение для поля %s.'
    }

    constructor (path: string, encoder: ISchemaEncoder = null) {
        const schemaContent = <any[]>JSON.parse(readFileSync(path, { encoding: 'utf-8', flag: 'r' })).fields;

        const method = (!!encoder) ? encoder : this.encoder;

        this.fields = schemaContent.map((field): Field => {
            const iField = <Field>method(field);
          
            this.codes.push(iField.code);
            
            return iField;
        })
    }

    static load(path: string, parser: ISchemaEncoder = null): Schema {
        return Schema.schemaInstance = new Schema(path, parser);
    }

    private static instance(): Schema {
        if (!Schema.instance) throw new Error('MARK schema as not loaded');

        return Schema.schemaInstance;
    }

    static field(code: string): Field|undefined {
        const instance = Schema.instance();

        const index = instance.codes.indexOf(code);;

        return instance.fields[index];
    }

    static fields(): Field[] {
        return Schema.instance().fields;
    }

    static setLocalization(localization: ILocalization): void {
        Schema.schemaInstance.localization = localization;
    }

    static getRuleLocalization(rule: string, ...args: string[]) {
        return format(Schema.instance().localization[rule], ...args);
    }

    private encoder(field): Field {
        const iField: Field = new Field(field.code, field.required, field.repeatable, field.active_rsl ?? false);

        ['ind1', 'ind2'].forEach(ind => { 
            if (!!field[ind]) {
                iField.indicators.push(
                    new Indicator(
                        ind, 
                        field.ind1.values.map((code): string => <string>code.code)
                    )
                ) 
            }
        });

        (<any[]>(field.subfields ?? []))
            .forEach((subfield) => iField.subfields.push(
                new Subfield(subfield.code, subfield.required, subfield.repeatable)
            ));

        return iField;
    }

}

export interface ISchemaEncoder { ( field ): Field };