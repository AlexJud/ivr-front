import { Strings } from '../models/optionStrings';
import { Injectable } from '@angular/core';

@Injectable()
export class GrammarService {
    private _grammars: string[]
    private _asrTypes: ['Слитное распознавание', 'Распознавание по грамматике']

   constructor() {
       this._grammars = [Strings.LOAD_GRAMMAR, 'grammar.xml']
   }
   get grammars(): string[] {
       return this._grammars
   }

   get asrTypes(): string[] {
       return this._asrTypes
   }

   parseGrammar(grammarPath: string): string {
       for (let grammar of this._grammars) {
            if(grammarPath.indexOf(grammar) !== -1) {
                return grammar
            } else {
                return null
            }
       }
   }
   //TODO ПОлучить список доступных файлов с грамматиками
}
