import { CellType, Strings } from '../../graph/nodeProps/optionStrings';
import { Node } from '../../graph/nodes/nodes';
import { Utils } from '../../utils/utils';
import { Relation } from '../../graph/nodes/relation';
import { ViewNode, RowType, TableView, ColumsData } from '../viewNode';
import { BranchPropsPresent, RowWithSelectValue, BranchEdgesPresent } from './branchClasses';

export class BranchViewNode extends ViewNode {

    id: string
    parent: string
    type: string
    edgeList: BranchEdgesPresent[]
    props: BranchPropsPresent[]
    tableView: TableView

    public static createFromNode(node: Node): BranchViewNode {
        let newNode = new BranchViewNode()
        newNode.id = node.id
        newNode.type = node.type
        newNode.initializeEdges(node)
        newNode.initializeProps(node)

        return newNode
    }

    public static createNewNode(id: string, type: string, parent: string): BranchViewNode {
        let newNode = new BranchViewNode()
        newNode.id = id
        newNode.type = type
        newNode.parent = parent
        newNode.initializeEdges()
        newNode.initializeProps()

        return newNode
    }

    private initializeProps(node?: Node) {
        let rowType: CellType
        let rowValue: any
        this.props = []


        rowType = CellType.TEXTAREA
        rowValue = node === undefined ? '' : node.props.synthText
        this.props.push(this.createPropsRow(rowType, Strings.TEXT_FOR_SYNTHESIZE, rowValue))

        rowType = CellType.INPUT
        rowValue = node === undefined ? 'b=1&t=5000&nit=5000' : node.props.options
        this.props.push(this.createPropsRow(rowType, Strings.ASR_OPTION, rowValue))

        rowType = CellType.SELECT
        rowValue = new RowWithSelectValue (
                [Strings.BUILTIN_GRAMMAR, Strings.FILE_GRAMMAR],
                Utils.parseAsrType(node === undefined ? '' : node.props.grammar)
            )
        this.props.push(this.createPropsRow(rowType, Strings.ASR_TYPE, rowValue))

        rowType = CellType.SELECT
        rowValue = new RowWithSelectValue (
            [Strings.LOAD_GRAMMAR, 'grammar.xml'],
            ''
        )
        this.props.push(this.createPropsRow(rowType, Strings.GRAMMAR, rowValue))



        this.tableView = new TableView()
        this.tableView.displayedColumns = ['name', 'value']
        this.tableView.columnsData.push(new ColumsData("name", "Наименование"))
        this.tableView.columnsData.push(new ColumsData("value", "Значение"))
    }

    private initializeEdges(node?:Node) {
        let rowType: CellType
        let rowValue: any
        let length: number
        this.edgeList = []
        if(node === undefined || node.edgeList === undefined) {
            this.edgeList = []
        } else {
            length = node.edgeList.length
        }

        for(let i = 0; i < length; i++) {
            rowType = CellType.CARD_WITH_CHIPS
            rowValue = node === undefined ? '' : node.edgeList[i]
            this.edgeList.push(this.createEdgeRow(rowType, Strings.CARDNAME, rowValue))
        }
    }

    public createPropsRow(type: CellType, name: string, value: any): BranchPropsPresent {
        const row = new BranchPropsPresent()
        row.name = name
        row.value = value
        row.type = type
        return row
    }

    public createEdgeRow(type: CellType, cardName: string, value: any): BranchEdgesPresent {
        const row = new BranchEdgesPresent()
        row.id = value.id
        row.match = value.match /* === undefined ? '' : value.match */
        row.name = cardName + ' ' + value.id
        row.type = type
        return row
    }

    public addChildren(child: string,error): void {
        this.edgeList.push(this.createEdgeRow(CellType.CARD_WITH_CHIPS, Strings.CARDNAME, {id: child, match: []}))
    }
}
