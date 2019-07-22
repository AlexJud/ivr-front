import { Strings } from '../graph/nodeProps/optionStrings';
import { Injectable } from '@angular/core';

@Injectable()
export class GrammarService {
   private _grammars: string[]

   constructor() {
       this._grammars = [Strings.LOAD_GRAMMAR, 'grammar.xml']
   }
   get grammars(): string[] {
       return this._grammars
   }

   parseGrammar(grammarPath: string): string {
       for (let grammar in this._grammars) {
            if(grammarPath.indexOf(grammar) !== -1) {
                return grammar
            } else {
                return grammarPath
            }
       }
   }
   //TODO ПОлучить список доступных файлов с грамматиками
}