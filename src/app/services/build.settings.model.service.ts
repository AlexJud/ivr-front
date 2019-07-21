import { ModelService } from './model.service';
import { NodeType } from '../graph/nodes/nodes';

export class SettingsModelService {
    optionsData: []
    constructor(private _modelService: ModelService){

    }
    buildDataSource() {
        this._modelService.model.forEach(node => {
            switch(node.constructor.name) {
                case NodeType.ActionNode: {
        })
    }

    private buildActionNodeData() {

    }
}