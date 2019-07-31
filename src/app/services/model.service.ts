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
import { EndProps } from '../graph/nodeProps/endProps';

const START_DATA = [
  new ActionNode('root', {synthText:'Здравствуй, дружочек! Чего желаешь?', grammar: 'http://localhost/theme:graph', options: 'b=1&t=5000&nit=5000'}, []),
  // new ClassifierNode('classify', [new Relation('specifier', ['ничего', 'квартиру', 'машину', 'дальше', 'не знаю'])]),
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
      switch(node.type) {
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
          case NodeType.EndNode: {
            this._viewModel.set(node.id, this.buildViewNodeData(node, false))
            break;
          }
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
        viewNode.childrenTree = [new ViewNode(Strings.PARAMETRS, node.id)]
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
    // this._eventService._events.emit('addNode', newNode)
    this.addChildrenToParent(id, parent)
    console.log(this.viewModel);
  }

  addChildrenToParent(child: string, parent: string) {
    let parentViewNode = this.viewModel.get(parent)
    parentViewNode.edgeList.push(
      {
        id: child,
        match: '',
        type: {
          id: CellType.INPUT,
          match: CellType.INPUT
        }
      }
    )
    console.log(parentViewNode);
  }

  deleteViewNode(id: string) {
    this.viewModel.delete(id)
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
        value: node === undefined ? 'b=1&t=5000&nit=5000' : node.props.options,
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
        id: node === undefined ? undefined : node.edgeList.map(child => child.id).join(),
        type: {
          id: CellType.INPUT
        }
      }
    ]
    childrenTableView = {
      displayedColumns: ['id'],
      columnsData: [
          {columnId: 'id', 'columnName': Strings.CHILDREN},
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
          id: node === undefined ? '' : node.edgeList[i].id,
          match: node === undefined ? '' : node.edgeList[i].match.join(),
          type: {
            id: CellType.INPUT,
            match: CellType.INPUT
          }
        }
      );
    }
    childrenTableView = {
      displayedColumns: ['id', 'match'],
      columnsData: [
          {columnId: 'id', 'columnName': Strings.CHILDREN},
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
          asrOptions: node === undefined ? 'b=1&t=5000&nit=5000' : node.props[i].asrOptions,
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
        id: node === undefined ? '' : node.edgeList.map(child => child.id).join(),
        type: {
          id: CellType.INPUT
        }
      }
    ]
    childrenTableView = {
      displayedColumns: ['id'],
      columnsData: [
          {columnId: 'id', 'columnName': Strings.CHILDREN},
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
    optionsDataSource = [
      {
        name: "Текст для синтеза",
        value: node === undefined ? '' : node.props.synthText,
        type: {
          name: CellType.SPAN,
          value: CellType.INPUT
        }
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

  convertModel() {
    this.model = []
    const viewArray = [...this.viewModel.values()]
    viewArray.forEach((node) => {
      let newNode: Node
      switch(node.type) {
        case NodeType.ActionNode: {
          let actionProps = new ActionProps();
          node.options.forEach((prop) => {
            switch(prop.name) {
              case Strings.TEXT_FOR_SYNTHESIZE: {
                actionProps.synthText = prop.value
                break
              }
              case Strings.ASR_OPTION: {
                actionProps.options = prop.value
                break
              }
              case Strings.ASR_TYPE: {
                if(prop.value.selected === Strings.BUILTIN_GRAMMAR) {
                  actionProps.grammar = 'http://localhost/theme:graph'
                  break
                }
              }
              case Strings.GRAMMAR: {
                if (prop.value.selected === Strings.FILE_GRAMMAR) {
                  actionProps.grammar = '/etc/asterisk/' + prop.value.selected
                  break
                }
              }
            }
          })
          let edgeList: Relation[] = []
          node.edgeList.forEach((child) => {
            edgeList.push(new Relation(child.id))
          })
          newNode = new ActionNode(node.id, actionProps, edgeList)
          this.model.push(newNode)
          break
        }

        case NodeType.ClassifierNode: {
          let edgeList: Relation[] = []
          node.edgeList.forEach((child) => {
            edgeList.push(new Relation(child.id, child.match.split(',')))
          })
          newNode = new ClassifierNode(node.id, edgeList)
          this.model.push(newNode)
          break
        }

        case NodeType.SpecifierNode: {
          let specifierPropsArray: SpecifierProps[] = []
          node.options.forEach((prop) => {
            let specifierProps = new SpecifierProps()
            specifierProps.varName = prop.varName
            specifierProps.synthText = prop.synthText
            specifierProps.asrOptions = prop.asrOptions
            if(prop.asrType.selected === Strings.BUILTIN_GRAMMAR) {
              specifierProps.grammar = 'http://localhost/theme:graph'
            } else {
              specifierProps.grammar = prop.grammar.value.selected
            }
            specifierProps.keywords = prop.keywords.split(',')
            specifierPropsArray.push(specifierProps)
          })
          let edgeList: Relation[] = []
          node.edgeList.forEach((child) => {
            edgeList.push(new Relation(child.id))
          })
          newNode = new SpecifierNode(node.id, specifierPropsArray, edgeList)
          this.model.push(newNode)
          break
        }
        case NodeType.EndNode: {
          let endProps = new EndProps()
          endProps.synthText = node.options[0].value
          newNode = new EndNode(node.id, endProps)
          this.model.push(newNode)
          break
        }
      }
    })
    console.log(this.model);
  }

  saveToJson() {
    this.convertModel();
    this._http.sendModel(this.model).subscribe((data: any) => { console.log('OPA') },
      error => console.log(error));
    console.log(this.model);
  }

  requestModel() {
    this._http.requestModel().subscribe((response: any) => {
      this.model = response
      console.log(response);
      this.buildViewModel()
      this._eventService._events.emit('updateModel');
    }, error => {
      // this.model = START_DATA;
      // this._eventService._events.emit("modelReceived")
      console.log(error);
    })
  }
}
