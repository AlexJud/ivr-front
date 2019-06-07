import {Injectable} from '@angular/core';
import {ExtractNode, ActionNode, Node} from '../nodes/nodes';

@Injectable()
export class ModelService {

  private _model: Node[];

  init() {
    this._model = [
      new ActionNode('root', ['obj1', 'obj2'], [new ExtractNode()]),
      new ActionNode('obj1', ['obj1', 'obj2'], [new ExtractNode()]),
      new ActionNode('obj2', ['obj1', 'obj2'], [new ExtractNode()]),
      new ActionNode('obj3', ['obj1', 'obj2'], [new ExtractNode()]),
      new ActionNode('obj4', ['obj1', 'obj2'], [new ExtractNode()]),
      new ActionNode('obj5', ['obj1', 'obj2'], [new ExtractNode()]),
      new ActionNode('obj6', ['obj1', 'obj2'], [new ExtractNode()]),
    ];
  }

  get model(): Node[] {
    return this._model;
  }
}
