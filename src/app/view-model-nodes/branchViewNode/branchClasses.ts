import { RowType } from '../viewNode';
import { CellType } from 'src/app/graph/nodeProps/optionStrings';

export class BranchPropsPresent {
    name: string
    value: any
    type: CellType
}

export class RowWithSelectValue {
    value: string[]
    selected: string

    constructor(value: string[], selected: string) {
        this.value = value
        this.selected = selected
    }
}