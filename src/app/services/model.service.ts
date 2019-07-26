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
import { Strings, CellType } from '../graph/nodeProps/optionStrings';
import { GrammarService } from './grammar.service';
import { DataSource } from '@angular/cdk/table';

const START_DATA = [
  new ActionNode('root', {synthText:'Здравствуй, дружочек! Чего желаешь?', grammar: 'http://localhost/theme:graph', options: 'b=1&t=5000&nit=5000'}, [new Relation('classify')]),
  new ClassifierNode('classify', [new Relation('specifier', ['ничего', 'квартиру', 'машину', 'дальше', 'не знаю'])]),
  // new SpecifierNode('specifier', [new SpecifierProps()], [new Relation('end')] ),
  // new EndNode('end', ['@name#, все понятно, до свидания!']),
];

export interface TableView {
  optionsDataSource?: any[],
  childrenDataSource?: any[],
  optionTableView?: any,
  childrenTableView?: any
}

@Injectable()
export class ModelService {

  private _model: Node[];
  private _viewModel = new Map<string, ViewNode>()
  private asrTypes: string[]
  constructor(private _http: HttpService,
              private _eventService: EventService,
              private _grammarService: GrammarService) {
    this.asrTypes = ['Слитное распознавание', 'Распознавание по грамматике']
  }

  get model(): Node[] {
    return this._model;
  }
  set model(model: Node[]) {
    this._model = model;
  }

  get viewModel(): Map<string, ViewNode> {
    return this._viewModel;
  }
  set viewModel(model: Map<string, ViewNode>) {
    this._viewModel = model;
  }

  init() {
    this.model = START_DATA;
    this.buildViewModel();
  }

  buildViewModel() {
     this.model.forEach(node => {
      switch(node.constructor.name) {
          case NodeType.ActionNode: {
            this._viewModel.set(node.id, this.buildViewNodeData(node, false))
            break;
          }
          case NodeType.ClassifierNode: {
            this._viewModel.set(node.id, this.buildViewNodeData(node, false))
            break;
          }
          case NodeType.SpecifierNode: {
            this._viewModel.set(node.id, this.buildViewNodeData(node, false))
            break;
          }
          // case NodeType.EndNode: {
          //     return this.buildEndViewNodeData(node)
          // }
      }
  })
  // console.log('MODEL IS HERE!!!!!!', this.settingsModel);
  // return this.settingsModel;
  }

  buildViewNodeData(node: any, isNew: boolean): ViewNode {
    let viewNode = new ViewNode()
    let tableView: TableView
    viewNode.id = node.id
    viewNode.type = node.type
    viewNode.parent = node.parent
    viewNode.childrenTree = [new ViewNode(Strings.CHILDREN, node.id), new ViewNode(Strings.PARAMETRS, node.id)]
    switch(node.type) {
      case NodeType.ActionNode: {
        tableView = this.createActionViewNodeOptions(isNew ? undefined : node)
        viewNode.childrenTree = [new ViewNode(Strings.CHILDREN, node.id), new ViewNode(Strings.PARAMETRS, node.id)]
        break;
      }
      case NodeType.ClassifierNode: {
        tableView = this.createClassifyViewNodeOptions(isNew ? undefined : node)
        viewNode.childrenTree = [new ViewNode(Strings.CHILDREN, node.id)]
        break;
      }
      case NodeType.SpecifierNode: {
        tableView = this.createSpecifierViewNodeOptions(isNew ? undefined : node)
        viewNode.childrenTree = [new ViewNode(Strings.CHILDREN, node.id), new ViewNode(Strings.PARAMETRS, node.id)]
        break;
      }
      case NodeType.EndNode: {
        tableView = this.createEndViewNodeOptions(isNew ? undefined : node)
        viewNode.childrenTree = [new ViewNode(Strings.CHILDREN, node.id), new ViewNode(Strings.PARAMETRS, node.id)]
        break;
      }
    }
    viewNode.edgeList = tableView.childrenDataSource
    viewNode.options = tableView.optionsDataSource
    viewNode.optionTableView = tableView.optionTableView
    viewNode.childrenTableView = tableView.childrenTableView
    return viewNode
  }

  addNewViewNode(id: string, type: string, parent:string) {
    let node = {id: id, type: type, parent: parent}
    let newNode: ViewNode = this.buildViewNodeData(node, true)
    this._viewModel.set(newNode.id, newNode);
  }

  createActionViewNodeOptions(node?: Node): TableView {
    let optionsDataSource
    let childrenDataSource
    let optionTableView
    let childrenTableView
    let grammar = this._grammarService.parseGrammar(node === undefined ? '' : node.props.grammar)
    optionsDataSource = [
      {
        name: "Текст для синтеза",
        value: node === undefined ? '' : node.props.synthText,
        type: {
          name: CellType.SPAN,
          value: CellType.INPUT
        }
      },
      {
        name: "Опции распознавания",
        value: node === undefined ? '' : node.props.options,
        type: {
          name: CellType.SPAN,
          value: CellType.INPUT
        }
      },
      {
        name: "Способ распознавания",
        value: {
          value: this.asrTypes,
          selected: this.parseAsrType(node === undefined ? '' : node.props.grammar)
        },
        type: {
          name: CellType.SPAN,
          value: CellType.SELECT
        }
      },
      {
        name: "Грамматика", 
        value: {
          value: this._grammarService.grammars, 
          selected: grammar
        },
        type: {
          name: CellType.SPAN,
          value: CellType.SELECT
        },
      },
    ]
    optionTableView = {
      displayedColumns: ['name', 'value'],
      columnsData: [
          {columnId: "name", columnName: "Наименование"},
          {columnId: "value", columnName: "Значение"}
      ]
    }
    childrenDataSource = [
      {
        child: node === undefined ? '' : node.edgeList.map(child => child.id).join(),
        type: {
          child: CellType.INPUT
        }
      }
    ]
    childrenTableView = {
      displayedColumns: ['child'],
      columnsData: [
          {columnId: 'child', 'columnName': Strings.CHILDREN},
      ]
    }
    return {
      optionsDataSource: optionsDataSource,
      childrenDataSource: childrenDataSource,
      optionTableView: optionTableView,
      childrenTableView: childrenTableView
    }
  }

  createClassifyViewNodeOptions(node?: Node): TableView {
    let childrenDataSource = []
    let childrenTableView
    let length;
    if(node !== undefined) {
      length = node.edgeList.length
    } else {
      length = 1
    }
    for(let i = 0; i < length; i++) {
      childrenDataSource.push(
        {
          child: node === undefined ? '' : node.edgeList[i].id,
          match: node === undefined ? '' : node.edgeList[i].match.join(),
          type: {
            child: CellType.INPUT,
            match: CellType.INPUT
          }
        }
      );
    }
    childrenTableView = {
      displayedColumns: ['child', 'match'],
      columnsData: [
          {columnId: 'child', 'columnName': Strings.CHILDREN},
          {columnId: 'match', 'columnName': Strings.KEYWORDS},
      ]
    }
    return {
      childrenDataSource: childrenDataSource,
      childrenTableView: childrenTableView
    }
  }
  
  createSpecifierViewNodeOptions(node?: any): TableView {
    let optionsDataSource = []
    let childrenDataSource
    let optionTableView
    let childrenTableView
    let length
    if(node !== undefined) {
      length = node.props.length
    } else {
      length = 1
    }
    for (let i = 0; i < length; i++) {
      let grammar = this._grammarService.parseGrammar(node === undefined ? '' : node.props[i].grammar)
      let asrType = this.parseAsrType(node === undefined ? '' : node.props[i].grammar)
      optionsDataSource.push(
        {
          varName: node === undefined ? '' : node.props[i].varName,
          synthText: node === undefined ? '' : node.props[i].synthText,
          asrOptions: node === undefined ? '' : node.props[i].asrOptions,
          asrType: {
            value: this.asrTypes,
            selected: asrType
          },
          grammar: {
            value: this._grammarService.grammars,
            selected: grammar
          },
          keywords: node === undefined ? '' : node.props[i].keywords.join(),
          type: {
            varName: CellType.INPUT,
            synthText: CellType.INPUT,
            asrOptions: CellType.INPUT,
            asrType: CellType.SELECT,
            grammar: CellType.SELECT,
            keywords: CellType.INPUT,
          }
        }
     )
      optionTableView = {
        displayedColumns: ['varName', 'synthText', 'asrOptions', 'asrType', 'grammar', 'keywords'],
        columnsData: [
            {columnId: "varName", columnName: Strings.VAR_NAME},
            {columnId: "synthText", columnName: Strings.TEXT_FOR_SYNTHESIZE},
            {columnId: "asrOptions", columnName: Strings.ASR_OPTION},
            {columnId: "asrType", columnName: Strings.ASR_TYPE},
            {columnId: "grammar", columnName: Strings.GRAMMAR},
            {columnId: "keywords", columnName: Strings.KEYWORDS}
        ]
      }
    }
    childrenDataSource = [
      {
        child: node === undefined ? '' : node.edgeList.map(child => child.id).join(),
        type: {
          child: CellType.INPUT
        }
      }
    ]
    childrenTableView = {
      displayedColumns: ['child'],
      columnsData: [
          {columnId: 'child', 'columnName': Strings.CHILDREN},
      ]
    }
    return {
      optionsDataSource: optionsDataSource,
      childrenDataSource: childrenDataSource,
      optionTableView: optionTableView,
      childrenTableView: childrenTableView
    }
  }

  createEndViewNodeOptions(node?: Node): TableView {
    let optionsDataSource
    let optionTableView
    let grammar = this._grammarService.parseGrammar(node === undefined ? '' : node.props.grammar)
    optionsDataSource = [
      {
        name: "Текст для синтеза",
        value: node === undefined ? '' : node.props.synthText,
        type: {
          name: CellType.SPAN,
          value: CellType.INPUT
        }
      },
      {
        name: "Опции распознавания",
        value: node === undefined ? '' : node.props.options,
        type: {
          name: CellType.SPAN,
          value: CellType.INPUT
        }
      },
      {
        name: "Способ распознавания",
        value: {
          value: this.asrTypes,
          selected: this.parseAsrType(node === undefined ? '' : node.props.grammar)
        },
        type: {
          name: CellType.SPAN,
          value: CellType.SELECT
        }
      },
      {
        name: "Грамматика", 
        value: {
          value: this._grammarService.grammars, 
          selected: grammar
        },
        type: {
          name: CellType.SPAN,
          value: CellType.SELECT
        },
      },
    ]
    optionTableView = {
      displayedColumns: ['name', 'value'],
      columnsData: [
          {columnId: "name", columnName: "Наименование"},
          {columnId: "value", columnName: "Значение"}
      ]
    }
    return {
      optionsDataSource: optionsDataSource,
      optionTableView: optionTableView,
    }
  }

  private parseAsrType(asrType: string): string {
    if(asrType.indexOf('localhost') !== -1 || asrType === '') {
        return this.asrTypes[0]
    } else {
        return this.asrTypes[1]
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
