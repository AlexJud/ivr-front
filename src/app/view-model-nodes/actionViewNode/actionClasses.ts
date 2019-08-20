import { RowType } from '../viewNode';

export abstract class ActionRowPresent {
    name: string
    value: any
    type: RowType
}

export class RowWithInput extends ActionRowPresent{
    value: string
}

export class RowWithSelect extends ActionRowPresent{
    value: RowWithSelectValue
}

export class RowWithSelectValue {
    value: string[]
    selected: string

    constructor(value: string[], selected: string) {
        this.value = value
        this.selected = selected
    }
}