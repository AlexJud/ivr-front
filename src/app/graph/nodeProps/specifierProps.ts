import { ValidatePropsVarNameItem } from './validatePropsVarListItem';

export class SpecifierProps {
    varName: string;
    synthText: string;
    asrOptions: string;
    grammar: string;
    keywords: string[];
    repeatMax: string;
    vaildateItems: ValidatePropsVarNameItem[]
    constructor() {
        this.varName = '';
        this.synthText = '';
        this.asrOptions = ''
        this.grammar = ''
        this.keywords = [];
        this.repeatMax = '';
    }
}