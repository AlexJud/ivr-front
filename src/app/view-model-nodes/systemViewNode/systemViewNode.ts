import { ViewNode } from '../viewNode';
import { Relation } from 'src/app/graph/nodes/relation';
import { Node } from '../../graph/nodes/nodes';
import { CellType, Strings } from 'src/app/graph/nodeProps/optionStrings';
import { SystemPropsPresent, SystemEdgesPresent, RowWithSelectValue } from './systemClasses';
import { Utils } from 'src/app/utils/utils';

export class SystemViewNode extends ViewNode {
    varName: string
    systemVar?: string
    plainText?: string

    public static createFromNode(node: Node): SystemViewNode {
        let newNode = new SystemViewNode()
        newNode.id = node.id
        newNode.type = node.type
        newNode.initializeEdges(node)
        newNode.initializeProps(node)

        return newNode
    }

    public static createNewNode(id: string, type: string, parent: string): SystemViewNode {
        let newNode = new SystemViewNode()
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

        rowType = CellType.INPUT
        rowValue = node === undefined ? '' : node.props.varName
        this.props.push(this.createPropsRow(rowType, Strings.VAR_NAME, rowValue))

        rowType = CellType.COMBOBOX
        rowValue = new RowWithSelectValue (
                [Strings.BUILTIN_GRAMMAR, Strings.FILE_GRAMMAR],
                Utils.parseAsrType(node === undefined ? '' : node.props.grammar)
            )
        this.props.push(this.createPropsRow(rowType, Strings.ASR_TYPE, rowValue))
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
            rowType = CellType.CARD_WITHOUT_CHIPS
            rowValue = node === undefined ? '' : node.edgeList[i]
            this.edgeList.push(this.createEdgeRow(rowType, Strings.CARDNAME, rowValue))
        }
    }

    public createPropsRow(type: CellType, name: string, value: any): SystemPropsPresent {
        const row = new SystemPropsPresent()
        row.name = name
        row.value = value 
        row.type = type
        return row
    }

    public createEdgeRow(type: CellType, cardName: string, value: any): SystemEdgesPresent {
        const row = new SystemEdgesPresent()
        row.id = value.id
        row.match = value.match
        row.name = cardName + ' ' + value.id
        row.type = type
        return row
    }

    addChildren(child: string) {
        this.edgeList.push(this.createEdgeRow(CellType.CARD_WITHOUT_CHIPS, Strings.CARDNAME, {id: child, match: ''}))
    }


}