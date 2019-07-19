import { Strings } from './optionStrings';
import { GrammarService } from 'src/app/services/grammar.service';

export class SpecifierProps {
    varName: string;
    synthText: string;
    asrOptions: string;
    grammar: string[]
    keywords: string[];
    repeat: string;
    builtinRecogAfterRepeat: boolean;
    recognizeWay = [Strings.BUILTIN_GRAMMAR, Strings.FILE_GRAMMAR]
    selected = ''
    disabled: boolean;
    constructor() {
        this.varName = '';
        this.synthText = '';
        this.asrOptions = ''
        this.grammar = [Strings.LOAD_GRAMMAR, 'grammar.xml']
        this.keywords = [];
        this.repeat = '';
        this.builtinRecogAfterRepeat = false;
        this.disabled = true;
    }
}