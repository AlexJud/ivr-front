import { CellType, Strings } from '../../graph/nodeProps/optionStrings';
import { Node } from '../../graph/nodes/nodes';
import { Utils } from '../../utils/utils';
import { Relation } from '../../graph/nodes/relation';
import { ViewNode, RowType, TableView, ColumsData } from '../viewNode';
import { ActionRowPresent, RowWithSelectValue, RowWithInput, RowWithSelect } from './actionClasses';

export class ActionViewNode extends ViewNode {

    id: string
    parent: string
    type: string
    edgeList: Relation[]
    options: ActionRowPresent[]
    tableView: TableView
    
    public static createFromNode(node: Node): ActionViewNode {
        let newNode = new ActionViewNode()
        newNode.id = node.id
        newNode.type = node.type
        newNode.edgeList = node.edgeList
        newNode.initializeData(node)

        return newNode
    }

    public static createNewNode(id: string, type: string, parent: string): ActionViewNode {
        let newNode = new ActionViewNode()
        newNode.id = id
        newNode.type = type
        newNode.parent = parent
        newNode.edgeList = []
        newNode.initializeData()

        return newNode
    }

    private initializeData(node?: Node) {
        let rowType: RowType
        let rowValue: any
        this.options = []

        rowType = RowType.getInstance(CellType.INPUT)
        rowValue = node === undefined ? '' : node.props.synthText
        this.options.push(this.createRow(rowType, Strings.TEXT_FOR_SYNTHESIZE, rowValue))
        
        rowType = RowType.getInstance(CellType.INPUT)
        rowValue = node === undefined ? 'b=1&t=5000&nit=5000' : node.props.options
        this.options.push(this.createRow(rowType, Strings.ASR_OPTION, rowValue))

        rowType = RowType.getInstance(CellType.SELECT)
        rowValue = new RowWithSelectValue (
                [Strings.BUILTIN_GRAMMAR, Strings.FILE_GRAMMAR],
                Utils.parseAsrType(node === undefined ? '' : node.props.grammar)
            )
        this.options.push(this.createRow(rowType, Strings.ASR_TYPE, rowValue))

        rowType = RowType.getInstance(CellType.SELECT)
        rowValue = new RowWithSelectValue (
            [Strings.LOAD_GRAMMAR, 'grammar.xml'],
            ''
        )
        this.options.push(this.createRow(rowType, Strings.GRAMMAR, { value: '', selected: ''}))
        
        this.tableView = new TableView()
        this.tableView.displayedColumns = ['name', 'value']
        this.tableView.columnsData.push(new ColumsData("name", "Наименование"))
        this.tableView.columnsData.push(new ColumsData("value", "Значение"))
    }

    public createRow(type: RowType, name: string, value: any): ActionRowPresent {
        let row: ActionRowPresent
        switch(type.value) {
            case CellType.INPUT: {
                row = new RowWithInput()
                row.name = name
                row.value = value 
                row.type = type
                break
            }
            case CellType.SELECT: {
                row = new RowWithSelect()
                row.name = name
                row.value = new RowWithSelectValue(value.value, value.selected)
                row.type = type
                break
            }
        }
        return row
    }
}