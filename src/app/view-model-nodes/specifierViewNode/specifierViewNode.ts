import { ViewNode, TableView, RowType, ColumsData } from '../viewNode';
import { Relation } from 'src/app/graph/nodes/relation';
import { Node } from '../../graph/nodes/nodes';
import { SpecifierRowPresent, SpecifierRowType, ColumnWithSelect } from './specifierClasses';
import { Strings } from 'src/app/graph/nodeProps/optionStrings';
import { Utils } from 'src/app/utils/utils';

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
        let rowType = new SpecifierRowType()
        let rowVarName: string
        let rowSynthText: string
        let rowAsrOptions: string
        let rowAsrType: ColumnWithSelect
        let rowGrammar: ColumnWithSelect
        let rowKeywords: string
        this.props = []
        let length
        if(node !== undefined) {
            length = node.props.length
        } else {
            length = 3
        }
        for (let i = 0; i < length; i++) {
            rowVarName = node === undefined ? '' : node.props[i].varName
            rowSynthText = node === undefined ? '' : node.props[i].synthText
            rowAsrOptions = node === undefined ? 'b=1&t=5000&nit=5000' : node.props[i].asrOptions
            rowAsrType = new ColumnWithSelect(
                [Strings.BUILTIN_GRAMMAR, Strings.FILE_GRAMMAR],
                Utils.parseAsrType(node === undefined ? '' : node.props.grammar))
            rowGrammar = new ColumnWithSelect([Strings.LOAD_GRAMMAR, 'grammar.xml'], '')
            rowKeywords = node === undefined ? '' : node.props[i].keywords.join()
            this.props.push(this.createRow({rowType, rowVarName, rowSynthText, rowAsrOptions, rowAsrType, rowGrammar, rowKeywords}))
        }

        this.tableView = new TableView()
        this.tableView.displayedColumns = ['varName', 'synthText', 'asrOptions', 'asrType', 'grammar', 'keywords']
        this.tableView.columnsData.push(new ColumsData("varName", Strings.VAR_NAME))
        this.tableView.columnsData.push(new ColumsData("synthText", Strings.TEXT_FOR_SYNTHESIZE))
        this.tableView.columnsData.push(new ColumsData("asrOptions", Strings.ASR_OPTION))
        this.tableView.columnsData.push(new ColumsData("asrType", Strings.ASR_TYPE))
        this.tableView.columnsData.push(new ColumsData("grammar", Strings.GRAMMAR))
        this.tableView.columnsData.push(new ColumsData("keywords", Strings.KEYWORDS))
    }

    private createRow(data: any): SpecifierRowPresent {
        let row: SpecifierRowPresent = new SpecifierRowPresent()
        row.asrOptions = data.rowAsrOptions
        row.asrType = data.rowAsrType
        row.grammar = data.rowGrammar
        row.keywords = data.rowKeywords
        row.synthText = data.rowSynthText
        row.type = data.rowType
        row.varName = data.rowVarName

        return row
    }

    public addChildren(child: string): void {
        this.edgeList.push(new Relation(child))
    }
}