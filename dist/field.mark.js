"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkField = void 0;
const schema_1 = require("./schema");
class MarkField {
    code;
    ind1;
    ind2;
    subfields;
    value;
    constructor(code, ind1, ind2, subfields, value) {
        this.code = code;
        this.ind1 = ind1;
        this.ind2 = ind2;
        this.subfields = subfields;
        this.value = value;
    }
    toValidatorStructure() {
        const schemaField = schema_1.Schema.field(this.code);
        const response = { code: this.code };
        schemaField?.indicators?.forEach((indicator) => response[indicator.name] = this[indicator.name]);
        this?.subfields?.forEach((subfield) => {
            const schemaSubfield = schemaField.subfields.filter(schemaSubfield => schemaSubfield.code === subfield.code)[0];
            if (schemaSubfield.isRepeatable && !response[subfield.code]) {
                response[subfield.code] = [subfield.value];
            }
            else if (schemaSubfield.isRepeatable) {
                response[subfield.code].push(subfield.value);
            }
            else {
                response[subfield.code] = subfield.value;
            }
        });
        if (!!this.value)
            response['value'] = this.value;
        return response;
    }
}
exports.MarkField = MarkField;
