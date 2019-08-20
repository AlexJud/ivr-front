import { ViewNode, RowType, TableView, ColumsData } from '../viewNode';
import { Node } from '../../graph/nodes/nodes';
import { Relation } from 'src/app/graph/nodes/relation';
import { ClassifierRowPresent } from './classifierClasses';
import { CellType, Strings } from 'src/app/graph/nodeProps/optionStrings';

export class ClassifierViewNode extends ViewNode {
    id: string
    parent: string
    type: string
    edgeList: Relation[]
    options: ClassifierRowPresent[]
    tableView: TableView

    public static createFromNode(node: Node): ClassifierViewNode {
        let newNode = new ClassifierViewNode()
        newNode.id = node.id
        newNode.type = node.type
        newNode.edgeList = node.edgeList
        newNode.initializeData(node)

        return newNode
    }

    public static createNewNode(id: string, type: string, parent: string): ClassifierViewNode {
        let newNode = new ClassifierViewNode()
        newNode.id = id
        newNode.type = type
        newNode.parent = parent
        newNode.edgeList = []
        newNode.initializeData()

        return newNode
    }

    private initializeData(node?: Node) {
        let rowType: RowType
        let rowID: string
        let rowMatch: string
        this.options = []

        rowType = RowType.getInstance(CellType.INPUT)
        if(node !== undefined) {
            length = node.edgeList.length
        } else {
            length = 0
        }
        for(let i = 0; i < length; i++) {
            rowID = node === undefined ? '' : node.edgeList[i].id
            rowMatch = node === undefined ? '' : node.edgeList[i].match.join()
            this.options.push(this.createRow(rowType, rowID, rowMatch));
        }

        this.tableView = new TableView()
        this.tableView.displayedColumns = ['id', 'match']
        this.tableView.columnsData.push(new ColumsData("id", Strings.CHILDREN))
        this.tableView.columnsData.push(new ColumsData("match", Strings.KEYWORDS))
    }

    private createRow(type: RowType, id: string, match: string): ClassifierRowPresent {
        let row: ClassifierRowPresent = new ClassifierRowPresent()
        row.id = id
        row.match = match
        row.type = type

        return row
    }
}