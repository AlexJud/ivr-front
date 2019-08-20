import { Strings } from '../graph/nodeProps/optionStrings';

export class Utils {
    public static parseAsrType(asrType: string): string {
        if(asrType.indexOf('localhost') !== -1 || asrType === '') {
            return Strings.BUILTIN_GRAMMAR
        } else {
            return Strings.FILE_GRAMMAR
        }
    }

    // public static parseGrammar(grammarPath: string): string {
    //     for (let grammar of this._grammars) {
    //          if(grammarPath.indexOf(grammar) !== -1) {
    //              return grammar
    //          } else {
    //              return null
    //          }
    //     }
    // }
}