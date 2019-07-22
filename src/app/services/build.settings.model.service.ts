import { ModelService } from './model.service';
import { NodeType, Node } from '../graph/nodes/nodes';
import { Strings, CellType } from '../graph/nodeProps/optionStrings';
import { GrammarService } from './grammar.service';
import { ActionNodeInterface } from '../grid-settings/interfaces/settings.modelinterfaces'

export class SettingsModelService {
    settingsModel: {}
    asrTypes: string[]
    constructor(private _modelService: ModelService,
                private _grammarService: GrammarService){
        this.asrTypes = ['Слитное распознавание', 'Распознавание по грамматике']
    }
    buildDataSource() {
        this._modelService.model.forEach(node => {
            // switch(node.constructor.name) {
            //     case NodeType.ActionNode: {
            //     }
            // }
        })
    }

    private buildActionNodeData(node: Node) {
        let selectedAsrType = this.parseAsrType(node.props.grammar)
        let selectedGrammar = this._grammarService.parseGrammar(node.props.grammar)
        this.settingsModel[node.id].options = [
            {name: Strings.TEXT_FOR_SYNTHESIZE, value: node.props.synthText, type: CellType.INPUT},
            {name: Strings.ASR_OPTION, value: node.props.options, type: CellType.INPUT},
            {name: Strings.ASR_TYPE, values: this.asrTypes, type: CellType.SELECT, selected: selectedAsrType},
            {name: Strings.GRAMMAR, values: this._grammarService.grammars, type: CellType.SELECT, selected: selectedGrammar, hidden: true}
        ]
        this.childrenData[node.id] = [];
        
        if(node.edgeList[0] !== null && node.edgeList.length !== 0) {
        this.childrenData[node.id] =
            [
                {id: node.edgeList[0].id}
            ]
        }
        this.columnMap.set(node.id, {
        options: ['option', 'value'],
        children: ['id']
        })
    }

    private parseAsrType(asrType: string): string {
        if(asrType.indexOf('localhost') !== -1) {
            return this.asrTypes[0]
        } else {
            return this.asrTypes[1]
        }
    }
}