import { ValidatePropsVarNameItem } from './validatePropsVarListItem';
import { Relation } from '../nodes/relation';

export class SpecifierProps {
    varName: string;
    synthText: string;
    asrOptions: string;
    grammar: string;
    match: string[];
    matchFile: string;
    repeatMax: string;
    constructor() {
        this.varName = '';
        this.synthText = '';
        this.asrOptions = ''
        this.grammar = ''
        this.match = [];
        this.repeatMax = '';
    }
}