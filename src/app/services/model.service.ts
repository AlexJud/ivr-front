import { ExtractProps } from './../graph/nodeProps/extractProps';
import { ActionProps } from './../graph/nodeProps/actionProps';
import { Injectable } from '@angular/core';
import { ExtractNode, ActionNode, Node, ClassifierNode, NodeType, ValidateNode, SpecifierNode, EndNode } from '../graph/nodes/nodes';
import { Relation } from '../graph/nodes/relation';
import { HttpService } from './http.service';
import { ValidateProps } from '../graph/nodeProps/validateProps';
import { SpecifierProps } from '../graph/nodeProps/specifierProps';
import { error } from '@angular/compiler/src/util';
import { EventService } from './event.service';
import { ViewNode } from '../view-model-nodes/view.model-node';
import { Strings } from '../graph/nodeProps/optionStrings';
import { GrammarService } from './grammar.service';
import { type } from 'os';

const START_DATA = [
  new ActionNode('root', {synthText:'Здравствуй, дружочек! Чего желаешь?', grammar: 'http://localhost/theme:graph', options: 'b=1&t=5000&nit=5000'}, [new Relation('classify')]),
  // new ClassifierNode('classify', [new Relation('specifier', ['ничего', 'квартиру', 'машину', 'дальше', 'не знаю'])]),
  // new SpecifierNode('specifier', [new SpecifierProps()], [new Relation('end')] ),
  // new EndNode('end', ['@name#, все понятно, до свидания!']),
];

@Injectable()
export class ModelService {

  private _model: Node[];
  private _viewModel: ViewNode[]

  constructor(private _http: HttpService,
              private _eventService: EventService,
              private _grammarService: GrammarService) {

  }

  get model(): Node[] {
    return this._model;
  }
  set model(model: Node[]) {
    this._model = model;
  }

  get viewModel(): ViewNode[] {
    return this._viewModel;
  }
  set viewModel(model: ViewNode[]) {
    this._viewModel = model;
  }

  init() {
    this.model = START_DATA;
    this.buildViewModel();
  }

  buildViewModel() {
    this.viewModel = this.model.map(node => {
      switch(node.constructor.name) {
          case NodeType.ActionNode: {
              return this.buildActionViewNodeData(node)
          }
          // case NodeType.ClassifierNode: {
          //     return this.buildClassifierViewNodeData(node)
          // }
          // case NodeType.SpecifierNode: {
          //     return this.buildSpecifierViewNodeData(node)
          // }
          // case NodeType.EndNode: {
          //     return this.buildEndViewNodeData(node)
          // }
      }
  })
  // console.log('MODEL IS HERE!!!!!!', this.settingsModel);
  // return this.settingsModel;
  }

  private buildActionViewNodeData(node: Node): ViewNode {
    let actionViewNode = new ViewNode();
    actionViewNode.id = node.id;
    actionViewNode.type = node.type;
    actionViewNode.childrenTree = [new ViewNode(Strings.CHILDREN, node.id), new ViewNode(Strings.PARAMETRS, node.id)]
    actionViewNode.options = [
      {name: "Текст для синтеза", value: node.props.synthText},
      {name: "Опции распознавания", value: node.props.options},
      {name: "Способ распознавания", value: this._grammarService.parseGrammar},
      {name: "Грамматика", value: this._grammarService.grammars}
    ]
    actionViewNode.edgeList = node.edgeList,
    actionViewNode.optionTableView = {
      displayedColumn: ['name', 'value'],
      columnData: [
          {columnId: "name", columnName: "Наименование"},
          {columnId: "value", columnName:"Значение"}
      ]
    }
    actionViewNode.childrenTableView = {
      childrenTableView: {
        displayedColumn: ['child'],
        columnData: [
            {columnId: 'child', 'columnName': 'Дочерние узлы'},
        ]
      }
    }
    return actionViewNode
  }

  addNodeToViewModel(id: string, nodeType: string, parentId: string) {
    let newNode = new ViewNode()
    newNode.id = id
    newNode.type = nodeType
    newNode.parent = parentId
    newNode.childrenTree = [new ViewNode(Strings.CHILDREN, id), new ViewNode(Strings.PARAMETRS, id)]
    switch(nodeType){
      case NodeType.ActionNode: {
        newNode.options = [
          {name: "Текст для синтеза", value: ''},
          {name: "Опции распознавания", value: ''},
          {name: "Способ распознавания", value: ''},
          {name: "Грамматика", value: this._grammarService.grammars}
        ]
        newNode.edgeList = []
        newNode.optionTableView = {
          displayedColumn: ['name', 'value'],
          columnData: [
              {columnId: "name", columnName: "Наименование"},
              {columnId: "value", columnName:"Значение"}
          ]
        }
        newNode.childrenTableView = {
          childrenTableView: {
            displayedColumn: ['child'],
            columnData: [
                {columnId: 'child', 'columnName': 'Дочерние узлы'},
            ]
          }
        }
      }
    } 
  }

  // public addNodeToViewModel(id: string, nodeType: string, parentId: string): Node {
  //   let node: Node;
  //   let relation: Relation;
  //   switch (nodeType) {
  //     case NodeType.ActionNode: {
  //       node = new ActionNode(id, new ActionProps(), []);
  //       relation = new Relation(id);
  //       break;
  //     }
  //     case NodeType.ClassifierNode: {
  //       node = new ClassifierNode(id, []);
  //       relation = new Relation(id);
  //       break;
  //     }
  //     case NodeType.ExtractNode: {
  //       node = new ExtractNode(id, new ExtractProps(), []);
  //       relation = new Relation(id);
  //       break;
  //     }
  //     case NodeType.ValidateNode: {
  //       node = new ValidateNode(id, new ValidateProps());
  //       relation = new Relation(id);
  //       break;
  //     }
  //     case NodeType.SpecifierNode: {
  //       node = new SpecifierNode(id, [], []);
  //       relation = new Relation(id);
  //       break;
  //     }
  //     case NodeType.EndNode: {
  //       node = new EndNode(id, []);
  //       relation = new Relation(id);
  //       break;
  //     }
  //     default:
  //       console.warn("Unknown node TYPE!!!");
  //   }
  //   this.model.push(node);
  //   this.model.forEach((node) => {
  //     if (node.id === parentId) {
  //       node.edgeList.push(relation);
  //     }
  //   });

  //   this._eventService._events.emit('addNode', {node: node, parent: parentId});
  //   return node;
  // }

  getNode(nodeId: string): Node {
    let currentNode: Node;
    this.model.forEach((node) => {
      if (node.id === nodeId) {
        currentNode = node;
      }
    });
    return currentNode;
  }

  saveToJson() {
    this._http.sendModel(this.model).subscribe((data: any) => { console.log('OPA') },
      error => console.log(error));
    console.log(this.model);
  }

  private requestModel() {
    this._http.requestModel().subscribe((response: any) => {
      this.model = response.map(node => {
        switch (node.type) {
          case NodeType.ActionNode: {
            node = new ActionNode(node.id, node.props, node.edgeList);
            return node;
          }
          case NodeType.ClassifierNode: {
            node = new ClassifierNode(node.id, node.edgeList);
            return node;
          }
          case NodeType.EndNode: {
            node = new EndNode(node.id, node.props);
            return node;
          }
          case NodeType.ExtractNode: {
            node = new ExtractNode(node.id, node.props, node.edgeList);
            return node;
          }
          case NodeType.SpecifierNode: {
            node = new SpecifierNode(node.id, node.props, node.edgeList);
            return node;
          }
          case NodeType.ValidateNode: {
            node = new ValidateNode(node.id, node.props);
            return node;
          }
        }
      });
      console.log(this.model);
      this._eventService._events.emit('modelReceived');
    }, error => {
      this.model = START_DATA;
      this._eventService._events.emit("modelReceived")
      console.log(error);
    })
  }
}
