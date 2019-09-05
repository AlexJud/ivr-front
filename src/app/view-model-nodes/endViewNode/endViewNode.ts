import { ViewNode, TableView, RowType, ColumsData } from '../viewNode';
import { Relation } from 'src/app/graph/nodes/relation';
import { CellType, Strings } from 'src/app/graph/nodeProps/optionStrings';
import { Node } from '../../graph/nodes/nodes';
import { EndRowPresent } from './endClasses';

export class EndViewNode extends ViewNode {
    props: EndRowPresent[]

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
        let rowType: CellType
        let rowValue: any
        this.props = []

        rowType = CellType.TEXTAREA
        rowValue = node === undefined ? '' : node.props.synthText
        this.props.push(this.createRow(rowType, Strings.TEXT_FOR_SYNTHESIZE, rowValue))
    }

    public createRow(type: CellType, name: string, value: any): EndRowPresent {
        let row: EndRowPresent = new EndRowPresent()
            row.name = name
            row.value = value 
            row.type = type
        return row
    }
    
    public addChildren(child: string): void {
        // this.edgeList.push(new Relation(child))
    }
}