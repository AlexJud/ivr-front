import { CellType } from 'src/app/graph/nodeProps/optionStrings';

import { RowType } from '../viewNode';

export class SpecifierRowPresent {
    name: string
    value: any
    type: CellType
}

export class ColumnWithSelect {
    value: string[]
    selected: string

    constructor(value: string[], selected: string) {
        this.value = value
        this.selected = selected
    }
}

export class SpecifierRowType {
    varName = CellType.INPUT
    synthText = CellType.INPUT
    asrOptions = CellType.INPUT
    asrType = CellType.SELECT
    grammar = CellType.SELECT
    keywords = CellType.INPUT
  }