import {Injectable} from '@angular/core';
import {ExtractNode, ActionNode, Node, ClassifierNode} from '../nodes/nodes';

@Injectable()
export class ModelService {

  private _model: Node[];

  init() {
    const classify = new ClassifierNode('classify', []);
    this._model = [
      new ActionNode('root', ['Текст для синтеза', 'b=1'], []),
      new ClassifierNode('classify', ['buy_ext_estate', 'support_ext_name', 'transfer_ask_number']),
      new ExtractNode('buy_ext_estate', ['estate', 'rawEstate'], []),
      new ExtractNode('support_ext_name', ['name', 'rawName'], []),
      new ExtractNode('support_ext_name', ['name', 'rawName'], []),
    ];
  }
//   this._model = [
//     new ActionNode('root', ['Текст для синтеза', 'b=1'], [{id: 'classify'}]),
//     new ClassifierNode('classify', [{id: 'buy_ext_estate'}, {id: 'support_ext_name'}, {id: 'transfer_ask_number'}]),
//     new ExtractNode('buy_ext_estate', ['estate', 'rawEstate'], []),
//     new ExtractNode('support_ext_name', ['name', 'rawName'], []),
//     new ExtractNode('support_ext_name', ['name', 'rawName'], []),
//   ];
// }
  get model(): Node[] {
    return this._model;
  }
}
