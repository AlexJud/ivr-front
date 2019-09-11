import { ViewNode, TableView, RowType, ColumsData } from '../viewNode';
import { Relation } from 'src/app/graph/nodes/relation';
import { Node, SpecifierNode } from '../../graph/nodes/nodes';
import { SpecifierRowPresent, SpecifierRowType, ColumnWithSelect, SpecifierEdgePresent } from './specifierClasses';
import { Strings, CellType } from 'src/app/graph/nodeProps/optionStrings';
import { Utils } from 'src/app/utils/utils';
import { RowWithSelectValue } from '../branchViewNode/branchClasses';

export class SpecifierViewNode extends ViewNode {
    id: string
    parent: string
    type: string
    edgeIfEmpty: SpecifierEdgePresent[]
    edgeList: SpecifierEdgePresent[]
    props: SpecifierRowPresent[]
    tableView: TableView

    public static createFromNode(node: Node): SpecifierViewNode {
        let newNode = new SpecifierViewNode()
        newNode.id = node.id
        newNode.type = node.type
        newNode.initializeEdges(node)
        newNode.initializeData(node)

        return newNode
    }

    public static createNewNode(id: string, type: string, parent: string): SpecifierViewNode {
        let newNode = new SpecifierViewNode()
        newNode.id = id
        newNode.type = type
        newNode.parent = parent
        newNode.initializeEdges()
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

        // rowType = CellType.INPUT
        // rowValue = node === undefined ? 'b=0&t=5000&nit=5000' : node.props.asrOptions
        // this.props.push(this.createRow(rowType, Strings.ASR_OPTION, rowValue))

        rowType = CellType.SELECT
        let asr = Utils.parseAsrType(node === undefined ? '' : node.props.grammar)
        rowValue = new RowWithSelectValue (
                [Strings.BUILTIN_GRAMMAR, Strings.FILE_GRAMMAR],
                asr,
                false
            )
        this.props.push(this.createRow(rowType, Strings.ASR_TYPE, rowValue))

        rowType = CellType.SELECT
        rowValue = new RowWithSelectValue (
            [Strings.LOAD_GRAMMAR, 'grammar.xml'],
            '',
            asr === Strings.BUILTIN_GRAMMAR ? true : false
        )
        this.props.push(this.createRow(rowType, Strings.GRAMMAR, rowValue))

        rowType = CellType.INPUT
        rowValue = node === undefined ? '' : node.props.varName
        this.props.push(this.createRow(rowType, Strings.VAR_NAME, rowValue))

        rowType = CellType.CARD_WITH_CHIPS
        rowValue = node === undefined ? new Array : node.props.match
        this.props.push(this.createRow(rowType, Strings.KEYWORDS, rowValue))

    }
    private initializeEdges(node?:Node) {
        let rowType: CellType
        let rowValue: any
        let length: number
        this.edgeList = []
        this.edgeIfEmpty = []
        if(node === undefined || node.edgeList === null) {
            this.edgeList
        } else {
            length = node.edgeList.length
        }
        if(node === undefined || node.edgeIfEmpty === null) {
            this.edgeIfEmpty
        } else {
            length = node.edgeIfEmpty.length
        }
        for(let i = 0; i < length; i++) {
            rowType = CellType.CARD_WITHOUT_CHIPS
            rowValue = node === undefined ? '' : node.edgeList[i]
            this.edgeList.push(this.createEdgeRow(rowType, Strings.CARD_SUCCESS, rowValue))
        }

        for(let i = 0; i < length; i++) {
            rowType = CellType.CARD_WITHOUT_CHIPS
            rowValue = node === undefined ? '' : node.edgeIfEmpty[i]
            this.edgeIfEmpty.push(this.createEdgeRow(rowType, Strings.CARD_FAIL, rowValue))
        }
    }

    public createRow(type: CellType, name: string, value: any): SpecifierRowPresent {
        const row = new SpecifierRowPresent()
        row.name = name
        row.value = value
        row.type = type
        return row
    }
    public createEdgeRow(type: CellType, cardName: string, value: any): SpecifierEdgePresent {
        const row = new SpecifierEdgePresent()
        row.id = value.id
        row.name = cardName + ' ' + value.id
        row.type = type
        return row
    }
    public addChildren(child: string, error:boolean = false): void {
      if (error){
        this.edgeIfEmpty.push(this.createEdgeRow(CellType.CARD_WITHOUT_CHIPS, Strings.CARD_FAIL, {id: child}))
      } else{
        this.edgeList.push(this.createEdgeRow(CellType.CARD_WITHOUT_CHIPS, Strings.CARD_SUCCESS, {id: child}))
      }
    }
}
