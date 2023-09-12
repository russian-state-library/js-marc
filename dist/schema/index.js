"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
var fs_1 = require("fs");
var field_schema_1 = require("./field.schema");
var indicator_schema_1 = require("./indicator.schema");
var subfield_schema_1 = require("./subfield.schema");
var util_1 = require("util");
var Schema = /** @class */ (function () {
    function Schema(path, encoder) {
        if (encoder === void 0) { encoder = null; }
        var _this = this;
        this.codes = [];
        this.fields = [];
        this.localization = {
            required_field: 'Не передано обязательное поле %s.',
            required_indicator: 'Не передан обязательный индикатор %s для поля %s.',
            required_subfield: 'Не передано обязательное подполе $%s для поля %s.',
            required_value: 'Не передано значение для поля %s.'
        };
        var schemaContent = JSON.parse((0, fs_1.readFileSync)(path, { encoding: 'utf-8', flag: 'r' })).fields;
        var method = (!!encoder) ? encoder : this.encoder;
        this.fields = schemaContent.map(function (field) {
            var iField = method(field);
            _this.codes.push(iField.code);
            return iField;
        });
    }
    Schema.load = function (path, parser) {
        if (parser === void 0) { parser = null; }
        return Schema.schemaInstance = new Schema(path, parser);
    };
    Schema.instance = function () {
        if (!Schema.instance)
            throw new Error('MARK schema as not loaded');
        return Schema.schemaInstance;
    };
    Schema.field = function (code) {
        var instance = Schema.instance();
        var index = instance.codes.indexOf(code);
        ;
        return instance.fields[index];
    };
    Schema.fields = function () {
        return Schema.instance().fields;
    };
    Schema.setLocalization = function (localization) {
        Schema.schemaInstance.localization = localization;
    };
    Schema.getRuleLocalization = function (rule) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return util_1.format.apply(void 0, __spreadArray([Schema.instance().localization[rule]], args, false));
    };
    Schema.prototype.encoder = function (field) {
        var _a, _b;
        var iField = new field_schema_1.Field(field.code, field.required, field.repeatable, (_a = field.active_rsl) !== null && _a !== void 0 ? _a : false);
        ['ind1', 'ind2'].forEach(function (ind) {
            if (!!field[ind]) {
                iField.indicators.push(new indicator_schema_1.Indicator(ind, field.ind1.codes.map(function (code) { return code.code; })));
            }
        });
        ((_b = field.subfields) !== null && _b !== void 0 ? _b : [])
            .forEach(function (subfield) { return iField.subfields.push(new subfield_schema_1.Subfield(subfield.code, subfield.required, subfield.repeatable)); });
        return iField;
    };
    return Schema;
}());
exports.Schema = Schema;
;
