export interface IRule {
    key: string,
    rule: string[]
}

export interface IMarkField {
    code: string,
    ind1?: string,
    ind2?: string,
    subfields?: { 
        code: string, 
        value: string 
    }[],
    value?: string
}

export interface ILocalization {
    required_field: string,
    required_indicator: string,
    required_subfield: string
    required_value: string
}