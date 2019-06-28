import {Injectable} from '@angular/core';
import {ExtractNode, ActionNode, Node, ClassifierNode, NodeType, ValidateNode, SpecifierNode, EndNode} from '../graph/nodes/nodes';
import { Relation } from '../graph/nodes/relation';
import { HttpService } from './http.service';
import { ValidateProps } from '../graph/nodeProps/validateProps';
import { SpecifierProps } from '../graph/nodeProps/specifierProps';

@Injectable()
export class ModelService {

  private _model: Node[];
  constructor(private _http: HttpService) {

  }
  init() {
    const classify = new ClassifierNode('classify', []);
    let props = new SpecifierProps();
    props.asrOptions = 'b=1&t=5000&nit=5000';
    props.grammar = 'http://localhost/theme:graph';
    props.synthText = 'Как тебя зовут?'
    props.varName = 'name'
    this._model = [
      new ActionNode('root', ['Здравствуй, дружочек! Чего желаешь?', 'http://localhost/theme:graph,b=1&t=5000&nit=5000'], [new Relation('classify')]),
      new ClassifierNode('classify', [new Relation('specifier', ['ничего', 'квартиру', 'машину', 'дальше', 'не знаю'])]),
      new SpecifierNode('specifier', [props], [new Relation('end')] ),
      new EndNode('end', ['@name#, все понятно, до свидания!']),
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

  getNode(nodeId: string): Node {
    let currentNode: Node;
    this.model.forEach((node) => {
      if(node.id === nodeId) {
        currentNode = node;
      }
    });
    return currentNode;
  }
  saveToJson() {
    // let jsonFile = new File([], '../../assets/json');
    // new Blob();
    // const blob = new Blob([JSON.stringify(this.model)], { type: 'application/json' });
    // const url= window.URL.createObjectURL(blob);
    // window.open(url);
    this._http.sendModel(this.model).subscribe((data: any) => {console.log('OPA')},
    error => console.log(error));
    console.log(this.model);
  }
}
