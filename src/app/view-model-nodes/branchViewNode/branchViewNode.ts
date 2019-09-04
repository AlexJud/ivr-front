import { CellType, Strings } from '../../graph/nodeProps/optionStrings';
import { Node } from '../../graph/nodes/nodes';
import { Utils } from '../../utils/utils';
import { Relation } from '../../graph/nodes/relation';
import { ViewNode, RowType, TableView, ColumsData } from '../viewNode';
import { BranchPropsPresent, RowWithSelectValue } from './branchClasses';

export class BranchViewNode extends ViewNode {

    id: string
    parent: string
    type: string
    edgeList: Relation[]
    props: BranchPropsPresent[]
    tableView: TableView
    
    public static createFromNode(node: Node): BranchViewNode {
        let newNode = new BranchViewNode()
        newNode.id = node.id
        newNode.type = node.type
        newNode.edgeList = node.edgeList
        newNode.initializeData(node)

        return newNode
    }

    public static createNewNode(id: string, type: string, parent: string): BranchViewNode {
        let newNode = new BranchViewNode()
        newNode.id = id
        newNode.type = type
        newNode.parent = parent
        newNode.edgeList = [new Relation('', [''])]
        newNode.initializeData()

        return newNode
    }

    private initializeData(node?: Node) {
        let rowType: CellType
        let rowValue: any
        this.props = []

        rowType = CellType.TEXTAREA
        rowValue = node === undefined ? '' : node.props.synthText
        this.props.push(this.createRow(rowType, Strings.TEXT_FOR_SYNTHESIZE, rowValue))
        
        rowType = CellType.INPUT
        rowValue = node === undefined ? 'b=1&t=5000&nit=5000' : node.props.asrOptions
        this.props.push(this.createRow(rowType, Strings.ASR_OPTION, rowValue))

        rowType = CellType.SELECT
        rowValue = new RowWithSelectValue (
                [Strings.BUILTIN_GRAMMAR, Strings.FILE_GRAMMAR],
                Utils.parseAsrType(node === undefined ? '' : node.props.grammar)
            )
        this.props.push(this.createRow(rowType, Strings.ASR_TYPE, rowValue))

        rowType = CellType.SELECT
        rowValue = new RowWithSelectValue (
            [Strings.LOAD_GRAMMAR, 'grammar.xml'],
            ''
        )
        this.props.push(this.createRow(rowType, Strings.GRAMMAR, rowValue))

        this.tableView = new TableView()
        this.tableView.displayedColumns = ['name', 'value']
        this.tableView.columnsData.push(new ColumsData("name", "Наименование"))
        this.tableView.columnsData.push(new ColumsData("value", "Значение"))
    }

    public createRow(type: CellType, name: string, value: any): BranchPropsPresent {
        const row = new BranchPropsPresent()
        row.name = name
        row.value = value 
        row.type = type
        return row
    }

    public addChildren(child: string): void {
        this.edgeList.push(new Relation(child))
    }
}