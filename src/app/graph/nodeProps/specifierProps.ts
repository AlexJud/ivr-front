export class SpecifierProps {
    varName: string;
    synthText: string;
    asrOptions: string;
    grammar: string;
    keywords: string[];
    repeat: string;
    builtinRecogAfterRepeat: boolean;
    constructor() {
        this.varName = '';
        this.synthText = '';
        this.asrOptions = ''
        this.grammar = '';
        this.keywords = [];
        this.repeat = '';
        this.builtinRecogAfterRepeat = false;
    }
}