import { ViewNode, TableView, RowType, ColumsData } from '../viewNode';
import { Relation } from 'src/app/graph/nodes/relation';
import { Node } from '../../graph/nodes/nodes';
import { SpecifierRowPresent, SpecifierRowType, ColumnWithSelect } from './specifierClasses';
import { Strings, CellType } from 'src/app/graph/nodeProps/optionStrings';
import { Utils } from 'src/app/utils/utils';
import { RowWithSelectValue } from '../branchViewNode/branchClasses';

export class SpecifierViewNode extends ViewNode {
    id: string
    parent: string
    type: string
    edgeList: Relation[]
    props: SpecifierRowPresent[]
    tableView: TableView

    public static createFromNode(node: Node): SpecifierViewNode {
        let newNode = new SpecifierViewNode()
        newNode.id = node.id
        newNode.type = node.type
        newNode.edgeList = node.edgeList
        newNode.initializeData(node)

        return newNode
    }

    public static createNewNode(id: string, type: string, parent: string): SpecifierViewNode {
        let newNode = new SpecifierViewNode()
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

        rowType = CellType.INPUT
        rowValue = node === undefined ? '' : node.props.varName
        this.props.push(this.createRow(rowType, Strings.VAR_NAME, rowValue))

        rowType = CellType.CARD
        rowValue = node === undefined ? '' : node.props.match
        this.props.push(this.createRow(rowType, Strings.KEYWORDS, rowValue))

    }

    public createRow(type: CellType, name: string, value: any): SpecifierRowPresent {
        const row = new SpecifierRowPresent()
        row.name = name
        row.value = value 
        row.type = type
        return row
    }

    public addChildren(child: string): void {
        this.edgeList.push(new Relation(child))
    }
}