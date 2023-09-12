import { Validator } from 'neck-validator';
import { Indicator } from './indicator.schema';
import { Subfield } from './subfield.schema';

interface IField { 
    code: string;
    isRepeatable: boolean; 
    isRequired: boolean; 
    indicators: Indicator[];
    subfields: Subfield[];
};

export class Field implements IField {

    constructor(
        public readonly code: string, 
        public readonly isRequired: boolean, 
        public readonly isRepeatable: boolean,
        public readonly activeRsl: boolean,
        public indicators: Indicator[] = [],
        public subfields: Subfield[] = []

    ) {}

    rules(): object {
        const rules = {};

        let path = this.code;

        rules[path] = (this.isRequired) ? ['required'] : [];

        if (this.isRepeatable) {
            rules[path].push('array');
            path += Validator.VALIDATOR_RULE_DELIMITER + Validator.VALIDATOR_ARRAY_DELIMITER;
        }

        this.indicators.forEach(indicator => {
            const {key, rule} = indicator.rule(path + Validator.VALIDATOR_RULE_DELIMITER);
            rules[key] = rule;
        });

        this.subfields.forEach(
            subfield => subfield.rule(path + Validator.VALIDATOR_RULE_DELIMITER).forEach(
                ({ key, rule }) => rules[key] = rule
            )
        );

        if (this.subfields.length === 0) 
            rules[`${path}${Validator.VALIDATOR_RULE_DELIMITER}value`] = ['required', 'string'];

        return rules;
    }

    isValid(data: any): Validator {
        const validationData = {};
        validationData[this.code] = data;
        return Validator.validate(this.rules(), validationData);
    }

}