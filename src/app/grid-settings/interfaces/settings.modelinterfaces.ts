import { CellType } from 'src/app/graph/nodeProps/optionStrings';


export interface ActionNodeInterface {
    name: string
    value?: string
    values?: string[]
    type: CellType
    selected?: string
    hidden?: boolean
}