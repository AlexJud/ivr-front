import { Relation } from '../nodes/relation';

export class ValidatePropsVarNameItem {
    varName: string;
    repeatMax: number;
    edgeIfEmpty: Relation[];
}