import { CellType } from 'src/app/graph/nodeProps/optionStrings';

export interface SettingsModel {
    nodeId: {
        option: {
            displayedColumn: [],
            dataSource: [],
            columnData: [] 
        },
        children:
        {
            displayedColumn: [],
            dataSource: [],
            columnData: []
        }
    },

}

export interface ActionNodeInterface {
    name: string
    value?: string
    values?: string[]
    type: CellType
    selected?: string
    hidden?: boolean
}