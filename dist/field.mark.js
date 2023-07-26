"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkField = void 0;
var schema_1 = require("./schema");
var MarkField = /** @class */ (function () {
    function MarkField(code, ind1, ind2, subfields, value) {
        this.code = code;
        this.ind1 = ind1;
        this.ind2 = ind2;
        this.subfields = subfields;
        this.value = value;
    }
    MarkField.prototype.toValidatorStructure = function () {
        var _this = this;
        var _a, _b;
        var schemaField = schema_1.Schema.field(this.code);
        var response = { code: this.code };
        (_a = schemaField === null || schemaField === void 0 ? void 0 : schemaField.indicators) === null || _a === void 0 ? void 0 : _a.forEach(function (indicator) { return response[indicator.name] = _this[indicator.name]; });
        (_b = this === null || this === void 0 ? void 0 : this.subfields) === null || _b === void 0 ? void 0 : _b.forEach(function (subfield) {
            var schemaSubfield = schemaField.subfields.filter(function (schemaSubfield) { return schemaSubfield.code === subfield.code; })[0];
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
    };
    return MarkField;
}());
exports.MarkField = MarkField;
