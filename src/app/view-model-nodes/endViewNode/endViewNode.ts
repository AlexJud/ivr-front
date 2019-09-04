import { ViewNode, TableView, RowType, ColumsData } from '../viewNode';
import { Relation } from 'src/app/graph/nodes/relation';
import { CellType, Strings } from 'src/app/graph/nodeProps/optionStrings';
import { Node } from '../../graph/nodes/nodes';
import { EndRowPresent } from './endClasses';

export class EndViewNode extends ViewNode {
    id: string
    parent: string
    type: string
    edgeList: Relation[]
    props: EndRowPresent[]
    tableView: TableView

    public static createFromNode(node: Node): EndViewNode {
        let newNode = new EndViewNode()
        newNode.id = node.id
        newNode.type = node.type
        newNode.edgeList = node.edgeList
        newNode.initializeData(node)

        return newNode
    }

    public static createNewNode(id: string, type: string, parent: string): EndViewNode {
        let newNode = new EndViewNode()
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
        this.props = []

        rowType = RowType.getInstance(CellType.INPUT)
        rowValue = node === undefined ? '' : node.props.synthText
        this.props.push(this.createRow(rowType, Strings.TEXT_FOR_SYNTHESIZE, rowValue))

        this.tableView = new TableView()
        this.tableView.displayedColumns = ['name', 'value']
        this.tableView.columnsData.push(new ColumsData("name", "Наименование"))
        this.tableView.columnsData.push(new ColumsData("value", "Значение"))
    }

    public createRow(type: RowType, name: string, value: any): EndRowPresent {
        let row: EndRowPresent = new EndRowPresent()
            row.name = name
            row.value = value 
            row.type = type
        return row
    }
    
    public addChildren(child: string): void {
        this.edgeList.push(new Relation(child))
    }
}