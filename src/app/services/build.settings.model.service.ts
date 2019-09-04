import { ModelService } from './model.service';
import { NodeType, Node } from '../graph/nodes/nodes';
import { Strings, CellType } from '../graph/nodeProps/optionStrings';
import { GrammarService } from './grammar.service';
import { Injectable } from '@angular/core';

@Injectable()
export class SettingsModelService {
    settingsModel: any
    asrTypes: string[]
    constructor(private _modelService: ModelService,
                private _grammarService: GrammarService){
        this.asrTypes = ['Слитное распознавание', 'Распознавание по грамматике']
    }
    buildDataSource(): any {
        this._modelService.model.forEach(node => {
            switch(node.constructor.name) {
                case NodeType.BranchNode: {
                    this.buildActionNodeData(node)
                    break;
                }
                case NodeType.ClassifierNode: {
                    this.buildClassifierNodeData(node)
                    break;
                }
                case NodeType.SpecifierNode: {
                    this.buildSpecifierNodeData(node)
                    break;
                }
                case NodeType.EndNode: {
                    this.buildEndNodeData(node)
                }
            }
        })
        return this.settingsModel;
    }

    private buildActionNodeData(node: Node) {
        let selectedAsrType = 'this.parseAsrType(node.props.grammar)'
        let selectedGrammar = this._grammarService.parseGrammar(node.props.grammar)
        this.settingsModel[node.id].option.dataSource = [
            {name: Strings.TEXT_FOR_SYNTHESIZE, value: node.props.synthText, type: CellType.INPUT},
            {name: Strings.ASR_OPTION, value: node.props.options, type: CellType.INPUT},
            {name: Strings.ASR_TYPE, values: this.asrTypes, type: CellType.SELECT, selected: selectedAsrType},
            {name: Strings.GRAMMAR, values: this._grammarService.grammars, type: CellType.SELECT, selected: selectedGrammar, hidden: true}
        ]
        this.settingsModel[node.id].children.dataSource = [
            {id: node.edgeList[0].id}
        ]
        this.settingsModel[node.id].options.columnData = [
            {columnId: 'name', columnName: 'Наименование'},
            {columnId: 'value', columnName: 'Значение'},
        ]
        this.settingsModel[node.id].children.columnData = [
            {columnId: 'child', columnName: Strings.CHILDREN},
        ]
        this.settingsModel[node.id].options.displayedColumns = ['name', 'value']
        this.settingsModel[node.id].children.displayedColumns = ['child']
    }

    private buildClassifierNodeData(node: Node) {
        if(node.edgeList[0] !== null) {
            this.settingsModel[node.id] = {
                children: {
                    displayedColumns: [],
                    dataSource: [],
                    columnData: []
                }
            }
            node.edgeList.map((child) => {
                this.settingsModel[node.id].children.dataSource.push(
                    {
                        id: child.id, keywords: child.match
                    }
                );
            });
        }
        this.settingsModel[node.id].children.columnData = [
            {columnId: 'child', columnName: Strings.CHILDREN},
            {columnId: 'match', columnName: Strings.KEYWORDS},
        ]
        this.settingsModel[node.id].children.displayedColumns = ['child', 'match']
    }

    private buildSpecifierNodeData(node: Node) {
        this.settingsModel[node.id].option.dataSource = node.props.map(item => {
                return {
                    varName: item.varName,
                    synthText: item.synthText,
                    asrOptions: item.asrOptions,
                    asrType: this.asrTypes,
                    grammar: this._grammarService.grammars,
                    keywords: node.props.keywords,
                    selected: this._grammarService.parseGrammar(node.props.grammar),
                    hidden: true
                };
            })
        this.settingsModel[node.id].options.columnData = [
            {columnId: 'varName', columnName: Strings.VAR_NAME},
            {columnId: 'synthText', columnName: Strings.TEXT_FOR_SYNTHESIZE},
            {columnId: 'asrOptions', columnName: Strings.ASR_OPTION},
            {columnId: 'asrType', columnName: Strings.ASR_TYPE},
            {columnId: 'grammar', columnName: Strings.GRAMMAR},
            {columnId: 'keywords', columnName: Strings.KEYWORDS},
            {columnId: 'repeatCount', columnName: Strings.REPEAT},
        ]
        this.settingsModel[node.id].children.columnData = [
            {columnId: 'child', columnName: 'Дочерние узлы'},
        ]
        this.settingsModel[node.id].options.displayedColumns = ['varName', 'synthText', 'asrOptions', 'asrType', 'grammar', 'keywords', 'repeatCount']
        this.settingsModel[node.id].children.displayedColumns = ['child']
    }

    private buildEndNodeData(node: Node) {
        this.settingsModel[node.id].options = [
            {option: Strings.TEXT_FOR_SYNTHESIZE, value: node.props[0]},
        ]
        this.settingsModel[node.id].options.columnData = [
            {columnId: 'name', columnName: Strings.TEXT_FOR_SYNTHESIZE}
        ]
        this.settingsModel[node.id].options.displayedColumns = ['name']
    }


}