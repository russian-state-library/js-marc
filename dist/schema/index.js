"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
const fs_1 = require("fs");
const field_schema_1 = require("./field.schema");
const indicator_schema_1 = require("./indicator.schema");
const subfield_schema_1 = require("./subfield.schema");
const util_1 = require("util");
class Schema {
    static schemaInstance;
    codes = [];
    fields = [];
    localization = {
        required_field: 'Не передано обязательное поле %s.',
        required_indicator: 'Не передан обязательный индикатор %s для поля %s.',
        required_subfield: 'Не передано обязательное подполе $%s для поля %s.',
        required_value: 'Не передано значение для поля %s.'
    };
    constructor(config, encoder = null) {
        if (typeof config === 'string') {
            const schemaContent = JSON.parse((0, fs_1.readFileSync)(config.toString(), {
                encoding: 'utf-8',
                flag: 'r'
            })).fields;
            const method = (!!encoder) ? encoder : this.encoder;
            this.fields = schemaContent.map((field) => {
                const iField = method(field);
                this.codes.push(iField.code);
                return iField;
            });
        }
        else {
            this.fields = config.map((field) => {
                this.codes.push(field.code);
                return field;
            });
        }
    }
    static load(config, parser = null) {
        Schema.schemaInstance = null;
        return Schema.schemaInstance = new Schema(config, parser);
    }
    static instance() {
        if (!Schema.instance)
            throw new Error('MARK schema as not loaded');
        return Schema.schemaInstance;
    }
    static field(code) {
        const instance = Schema.instance();
        const index = instance.codes.indexOf(code);
        ;
        return instance.fields[index];
    }
    static fields() {
        return Schema.instance().fields;
    }
    static setLocalization(localization) {
        Schema.schemaInstance.localization = localization;
    }
    static getRuleLocalization(rule, ...args) {
        return (0, util_1.format)(Schema.instance().localization[rule], ...args);
    }
    encoder(field) {
        const iField = new field_schema_1.Field(field.code, field.required, field.repeatable, field.active_rsl ?? false);
        ['ind1', 'ind2'].forEach(ind => {
            if (!!field[ind]) {
                iField.indicators.push(new indicator_schema_1.Indicator(ind, field.ind1.values.map((code) => code.code)));
            }
        });
        (field.subfields ?? [])
            .forEach((subfield) => iField.subfields.push(new subfield_schema_1.Subfield(subfield.code, subfield.required, subfield.repeatable)));
        return iField;
    }
}
exports.Schema = Schema;
;
