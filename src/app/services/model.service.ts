import {Injectable} from '@angular/core';
import {ExtractNode, ActionNode, Node, ClassifierNode} from '../graph/nodes/nodes';
import { Relation } from '../graph/nodes/relation';

@Injectable()
export class ModelService {

  private _model: Node[];

  init() {
    const classify = new ClassifierNode('classify', []);
    this._model = [
      new ActionNode('root', ['Единый кол центр', 'b=1'], [new Relation('classify')]),
      new ClassifierNode('classify', [new Relation('buy_ext', ['some', 'key', 'words'])]),
      // new ExtractNode('buy_ext_estate', ['estate', 'rawEstate'], []),
      // new ExtractNode('support_ext_name', ['name', 'rawName'], []),
      // new ExtractNode('transfer_ask_number', ['name', 'rawName'], []),
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
