import { RowType } from '../viewNode';
import { CellType } from 'src/app/graph/nodeProps/optionStrings';

export class BranchPropsPresent {
    name: string
    value: any
    type: CellType
}

export class BranchEdgesPresent {
    id: string
    match: any
    name: string
    type: CellType

    constructor(id?:string, match?: string[], name?: string, type?: CellType) {
        this.id = id;
        this.match = match
        this.name = name
        this.type = type
    }
}

export class RowWithSelectValue {
    value: string[]
    selected: string

    constructor(value: string[], selected: string) {
        this.value = value
        this.selected = selected
    }
}