import { CellType } from 'src/app/graph/nodeProps/optionStrings';

import { RowType } from '../viewNode';

export class SpecifierRowPresent {
    varName: string
    synthText: string
    asrOptions: string
    asrType: ColumnWithSelect
    grammar: ColumnWithSelect
    keywords: string
    type: string
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