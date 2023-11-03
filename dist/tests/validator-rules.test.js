"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
index_1.Schema.load('./src/tests/schema/schema.json');
test('008', () => {
    index_1.MarkValidator.loadCustomRulesFromSchema({
        $schema: '',
        validators: [
            {
                "condition": {
                    "code": "880",
                    "6": {
                        "required": true
                    }
                },
                "validator": {
                    "6": {
                        relations: "false,true",
                        substringEqualsRegex: ",,^\d{3}-\d{1,}(\(3|\(B|\$1|\(N)|\(2|\(S$"
                    }
                },
                "messages": {
                    "6": "В указанном ссылочном поле в подполе $6 отсутствуют подполя из поля %code%"
                }
            },
            {
                "condition": {
                    "code": "880",
                    "6": {
                        "required": true
                    }
                },
                "validator": {
                    "6": {
                        "substringEqualsRegex": ",,^\d{3}-\d{1,}(\(3|\(B|\$1|\(N)|\(2|\(S$"
                    }
                },
                "messages": {
                    "6": "Неверно указано значение подполя 6 в поле 880."
                }
            },
            {
                "condition": {
                    "code": "880",
                    "6": {
                        "required": true
                    }
                },
                "validator": {
                    "6": `substringEqualsRegex:,,^[\\d{3}-\d{}]{4}$`
                },
                "messages": {
                    "6": "В указанном ссылочном поле в подполе $6 отсутствуют подполя из поля %code%"
                }
            },
            {
                "condition": {
                    "code": "880",
                    "6": {
                        "required": true
                    }
                },
                "validator": {
                    "6": "relations:true,false"
                },
                "messages": {
                    "6": "Значение индикаторов в поле 880 не соответствуют значениям индикаторов поля указанного в подполе $6"
                }
            },
            {
                "condition": {
                    "6": {
                        "required": true
                    }
                },
                "validator": {
                    "6": "relations:false,false"
                },
                "messages": {
                    "6": "Значение подполя $6 поля %code% не соответствует значению ссылки в подполе $6 указанного поля."
                }
            },
        ],
        required: []
    });
    console.log(index_1.Mark.validate([
        { code: '245', ind1: '', ind2: '', subfields: [{ code: '6', value: '880-01' }] },
        { code: '880', ind1: '', ind2: '', subfields: [] },
        { code: '880', ind1: '', ind2: '', subfields: [] },
        { code: '880', ind1: '', ind2: '', subfields: [] },
        { code: '880', ind1: '123', ind2: '', subfields: [{ code: '6', value: '245-01' }, { code: 'b', value: '123' }] },
    ]));
});
test('Обязательное подполе $a для полей кроме 260, 534, 541, 760,762,765,767,770,772,773,774,775,776,777,780, 856, 952', () => {
    index_1.MarkValidator.loadCustomRulesFromSchema({
        $schema: '',
        validators: [
            {
                "condition": {
                    "code": {
                        "whereNotIn": ["001", "002", "003", "005", "006", "007", "008", "260", "541", "856", "952", "534", "760", "762", "765", "767", "770", "772", "773", "774", "775", "776", "777", "780", "787", "505"]
                    }
                },
                "validator": {
                    "a": "required"
                },
                "messages": {
                    "a": "Не передано подполе $a для поля %code%."
                }
            }
        ],
        required: []
    });
    expect(index_1.Mark.validate([{ code: '979' }])).toEqual(["Не передано подполе $a для поля 979."]);
    expect(index_1.Mark.validate([{ code: '979', subfields: [{ code: 'a', value: 'any' }] }])).toEqual([]);
    expect(index_1.Mark.validate([{ code: '260' }])).toEqual([]);
});
test('505 t r', () => {
    index_1.MarkValidator.loadCustomRulesFromSchema({
        $schema: '',
        validators: [
            {
                "condition": {
                    "code": "505",
                    "or": {
                        "t": {
                            "notRequired": true
                        },
                        "r": {
                            "notRequired": true
                        }
                    }
                },
                "validator": {
                    "a": "required"
                },
                "messages": {
                    "a": "Не заполнено подполе $a для поля 505. Подполе $a для поля 505 необязтаельно к заполнению, если используются подполя $t и $r."
                }
            }
        ],
        required: []
    });
    expect(index_1.Mark.validate([{ code: '505' }])).toEqual(["Не заполнено подполе $a для поля 505. Подполе $a для поля 505 необязтаельно к заполнению, если используются подполя $t и $r."]);
    expect(index_1.Mark.validate([{ code: '505', subfields: [{ code: 't', value: 'any' }] }])).toEqual([]);
    expect(index_1.Mark.validate([{ code: '505', subfields: [{ code: 'r', value: 'any' }] }])).toEqual([]);
    expect(index_1.Mark.validate([{ code: '505', subfields: [{ code: 'r', value: 'any' }, { code: 't', value: 'any' }] }])).toEqual([]);
});
test('Обязательное подполе $b для поля 017', () => {
    index_1.MarkValidator.loadCustomRulesFromSchema({
        $schema: '',
        validators: [
            {
                "condition": {
                    "code": "017"
                },
                "validator": {
                    "b": "required"
                },
                "messages": {
                    "b": "Не передано подполе $b для поля %code%."
                }
            }
        ],
        required: []
    });
    expect(index_1.Mark.validate([{ code: '017' }])).toEqual(["Не передано подполе $b для поля 017."]);
    expect(index_1.Mark.validate([{ code: '017', subfields: [{ code: 'b', value: 'any' }] }])).toEqual([]);
});
test('Обязательное подполе $2 для поля 024 со значением в первом индикаторе 7', () => {
    index_1.MarkValidator.loadCustomRulesFromSchema({
        $schema: '',
        validators: [
            {
                "condition": {
                    "code": "024",
                    "ind1": "7"
                },
                "validator": {
                    "2": "required"
                },
                "messages": {
                    "2": "Не передано обязательное подполе $2 для поля %code% со значением первого индикатора - 7."
                }
            },
        ],
        required: []
    });
    expect(index_1.Mark.validate([{ code: '024', ind1: '1' }])).toEqual([]);
    expect(index_1.Mark.validate([{ code: '024', ind1: '7' }])).toEqual(['Не передано обязательное подполе $2 для поля 024 со значением первого индикатора - 7.']);
    expect(index_1.Mark.validate([{ code: '024', ind1: '7', subfields: [{ code: '2', value: '2' }] }])).toEqual([]);
});
test('Обязательное подполе $a, $b, $e для поля 040', () => {
    index_1.MarkValidator.loadCustomRulesFromSchema({
        $schema: '',
        validators: [
            {
                "condition": {
                    "code": "040"
                },
                "validator": {
                    "a": "required",
                    "b": "required",
                    "e": "required"
                },
                "messages": {
                    "a": "Не передано подполе $a для поля %code%.",
                    "b": "Не передано подполе $b для поля %code%.",
                    "e": "Не передано подполе $e для поля %code%."
                }
            },
        ],
        required: []
    });
    expect(index_1.Mark.validate([{ code: '040' }])).toEqual([
        'Не передано подполе $a для поля 040.',
        'Не передано подполе $b для поля 040.',
        'Не передано подполе $e для поля 040.'
    ]);
    expect(index_1.Mark.validate([{ code: '040', subfields: [{ code: 'a', value: '1' }] }])).toEqual([
        'Не передано подполе $b для поля 040.',
        'Не передано подполе $e для поля 040.'
    ]);
    expect(index_1.Mark.validate([{ code: '040', subfields: [{ code: 'a', value: '1' }, { code: 'b', value: '1' }] }])).toEqual([
        'Не передано подполе $e для поля 040.'
    ]);
    expect(index_1.Mark.validate([{ code: '040', subfields: [{ code: 'a', value: '1' }, { code: 'b', value: '1' }, { code: 'e', value: '1' }] }])).toEqual([]);
});
test('Обязательное подполе $d для поля 040, если в подполе $a указано не RuMoRGB.', () => {
    index_1.MarkValidator.loadCustomRulesFromSchema({
        $schema: '',
        validators: [
            {
                "condition": {
                    "code": "040",
                    "a": {
                        "notEquals": "RuMoRGB"
                    }
                },
                "validator": {
                    "d": "required"
                },
                "messages": {
                    "d": "Не передано подполе $d для поля %code%."
                }
            },
        ],
        required: []
    });
    expect(index_1.Mark.validate([{ code: '040', subfields: [{ code: 'a', value: '1' }] }])).toEqual(["Не передано подполе $d для поля 040."]);
    expect(index_1.Mark.validate([{ code: '040', subfields: [{ code: 'a', value: 'RuMoRGB' }] }])).toEqual([]);
});
test('Обязательный первый индикатор при использовании 041 поля.', () => {
    index_1.MarkValidator.loadCustomRulesFromSchema({
        $schema: '',
        validators: [
            {
                "condition": {
                    "code": "041"
                },
                "validator": {
                    "ind1": "required"
                },
                "messages": {
                    "ind1": "Не передан первый индикатор для поля %code%."
                }
            },
        ],
        required: []
    });
    expect(index_1.Mark.validate([{ code: '041' }])).toEqual(["Не передан первый индикатор для поля 041."]);
    expect(index_1.Mark.validate([{ code: '041', ind1: '1' }])).toEqual([]);
});
test('Обязательный первый индикатор при использовании 210 поля.', () => {
    index_1.MarkValidator.loadCustomRulesFromSchema({
        $schema: '',
        validators: [
            {
                "condition": {
                    "code": "041"
                },
                "validator": {
                    "ind1": "required"
                },
                "messages": {
                    "ind1": "Не передан первый индикатор для поля %code%."
                }
            },
        ],
        required: []
    });
    expect(index_1.Mark.validate([{ code: '041' }])).toEqual(["Не передан первый индикатор для поля 041."]);
    expect(index_1.Mark.validate([{ code: '041', ind1: '1' }])).toEqual([]);
});
test('Обязательный первый индикатор при использовании 100 поля.', () => {
    index_1.MarkValidator.loadCustomRulesFromSchema({
        $schema: '',
        validators: [
            {
                "condition": {
                    "code": {
                        "whereIn": ["100", "110", "111", "130", "490", "600", "610", "611", "630", "653", "700", "710", "711", "730"]
                    }
                },
                "validator": {
                    "ind1": "required"
                },
                "messages": {
                    "ind1": "Не передан первый индикатор для поля %code%."
                }
            },
        ],
        required: []
    });
    expect(index_1.Mark.validate([{ code: '100' }])).toEqual(["Не передан первый индикатор для поля 100."]);
    expect(index_1.Mark.validate([{ code: '100', ind1: '1' }])).toEqual([]);
});
test('Обязательный подполе $h для поля 041, если в позиции первого индикатора указано 1', () => {
    index_1.MarkValidator.loadCustomRulesFromSchema({
        $schema: '',
        validators: [
            {
                "condition": {
                    "code": "041",
                    "ind1": "1"
                },
                "validator": {
                    "h": "required"
                },
                "messages": {
                    "h": "Не передано подполе $h для поля %code%."
                }
            },
        ],
        required: []
    });
    expect(index_1.Mark.validate([{ code: '041', ind1: '1' }])).toEqual(["Не передано подполе $h для поля 041."]);
    expect(index_1.Mark.validate([{ code: '041', ind1: '1', subfields: [{ code: 'h', value: 'any' }] }])).toEqual([]);
    expect(index_1.Mark.validate([{ code: '041', ind1: '2' }])).toEqual([]);
    expect(index_1.Mark.validate([{ code: '041' }])).toEqual([]);
});
test('Обязательный подполе $2 для поля 041, если в позиции первого индикатора указано 7', () => {
    index_1.MarkValidator.loadCustomRulesFromSchema({
        $schema: '',
        validators: [
            {
                "condition": {
                    "code": "041",
                    "ind2": "7"
                },
                "validator": {
                    "2": "required"
                },
                "messages": {
                    "2": "Не передано подполе $2 для поля %code%."
                }
            },
        ],
        required: []
    });
    expect(index_1.Mark.validate([{ code: '041', ind1: '7' }])).toEqual(["Не передано подполе $2 для поля 041."]);
    expect(index_1.Mark.validate([{ code: '041', ind1: '7', subfields: [{ code: '2', value: 'any' }] }])).toEqual([]);
    expect(index_1.Mark.validate([{ code: '041', ind1: '7' }])).toEqual([]);
    expect(index_1.Mark.validate([{ code: '041' }])).toEqual([]);
});
test('1 Обязательный подполе $2 для поля 041, если в позиции первого индикатора указано 7', () => {
    index_1.MarkValidator.loadCustomRulesFromSchema({
        $schema: '',
        validators: [
            {
                "condition": {
                    "code": "008",
                    "value": {
                        "substringNotEquals": "16,19,|||"
                    }
                },
                "validator": {
                    "value": "substringEqualsFieldSubfield:16,17,code,044,a"
                },
                "messages": {
                    "value": "Подстрока с 15 по 16 символ в поле 008 не соответствет значению подполя $a поля 044."
                }
            },
        ],
        required: []
    });
    expect(index_1.Mark.validate([{ code: '008', value: '012345678901234|||890' }])).toEqual([]);
});
