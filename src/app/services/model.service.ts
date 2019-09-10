import {Injectable} from '@angular/core';
import {Node, NodeType, SpecifierNode, EndNode, BranchNode} from '../graph/nodes/nodes';
import {Relation} from '../graph/nodes/relation';
import {HttpService} from './http.service';
import {SpecifierProps} from '../graph/nodeProps/specifierProps';
import {EventService} from './event.service';
import {ViewNode} from '../view-model-nodes/viewNode';
import {BranchViewNode} from '../view-model-nodes/branchViewNode/branchViewNode';
import {Strings, CellType} from '../graph/nodeProps/optionStrings';
import {GrammarService} from './grammar.service';
import {EndProps} from '../graph/nodeProps/endProps';
import {SpecifierViewNode} from '../view-model-nodes/specifierViewNode/specifierViewNode';
import {EndViewNode} from '../view-model-nodes/endViewNode/endViewNode';
import {SystemViewNode} from '../view-model-nodes/systemViewNode/systemViewNode';
import { BranchProps } from '../graph/nodeProps/actionProps';

const START_DATA = [
  new BranchNode('root', {
    synthText: 'Здравствуй, дружочек! Чего желаешь?',
    grammar: 'http://localhost/theme:graph',
    asrOptions: 'b=0&t=5000&nit=5000'
  }),
  // new ClassifierNode('classify', [new Relation('specifier', ['ничего', 'квартиру', 'машину', 'дальше', 'не знаю'])]),
  // new SpecifierNode('specifier', [new SpecifierProps()], [new Relation('end')] ),
  // new EndNode('end', ['@name#, все понятно, до свидания!']),
];

export interface TableView {
  optionsDataSource?: any[],
  optionTableView?: any,
}

@Injectable()
export class ModelService {

  private _model: Node[];
  private _viewModel = new Map<string, ViewNode>()
  private asrTypes: string[]

  constructor(private _http: HttpService,
              private _eventService: EventService) {
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
      switch (node.type) {
        case NodeType.BranchNode: {
          this._viewModel.set(node.id, BranchViewNode.createFromNode(node))
          break;
        }
        case NodeType.ClassifierNode: {
          // this._viewModel.set(node.id, ClassifierViewNode.createFromNode(node))
          break;
        }
        case NodeType.SpecifierNode: {
          this._viewModel.set(node.id, SpecifierViewNode.createFromNode(node))
          break;
        }
        case NodeType.EndNode: {
          this._viewModel.set(node.id, EndViewNode.createFromNode(node))
          break;
        }
      }
    })
    this.setParents()
    console.log(this.viewModel);
  }

  private setParents() {
    this._viewModel.forEach(node => {
      let parentId = node.id
      if(node.edgeIfEmpty !== undefined) {
        node.edgeList.forEach(edge => {
          this._viewModel.get(edge.id).parent = parentId
        })
      }
      if(node.edgeIfEmpty !== undefined) {
        node.edgeIfEmpty.forEach(edge => {
          this._viewModel.get(edge.id).parent = parentId
        })
      }
    })
  }

  addNewViewNode(id: string, type: string, parent: string, error: boolean = false) {
    switch (type) {
      case NodeType.BranchNode: {
        console.log('TRACE1')
        this._viewModel.set(id, BranchViewNode.createNewNode(id, type, parent));
        console.log('map', this._viewModel.get(id))
        break
      }
      case NodeType.SystemNode: {
        this._viewModel.set(id, SystemViewNode.createNewNode(id, type, parent));
        break
      }
      case NodeType.SpecifierNode: {
        this._viewModel.set(id, SpecifierViewNode.createNewNode(id, type, parent));
        break
      }
      case NodeType.EndNode: {
        this._viewModel.set(id, EndViewNode.createNewNode(id, type, parent));
        break
      }
    }
    this.addChildrenToParent(id, parent, error)
    console.log('viewModel ', this.viewModel)
  }

  addChildrenToParent(child: string, parent: string, error: boolean) {
    this.viewModel.get(parent).addChildren(child, error)
  }

  deleteViewNode(id: string, root?) {
    let node = this.viewModel.get(id);
    console.log('NODE UNDEF', node)
    if (node.edgeIfEmpty) {
      for (let rec in node.edgeIfEmpty) {
        this.deleteViewNode(node.edgeIfEmpty[rec].id, id)
      }}
    if (node.edgeList) {
      for (let rec in node.edgeList) {
        this.deleteViewNode(node.edgeList[rec].id, id)
      }}

    if (!root){
      let parent = this.viewModel.get(node.parent);
      if (parent.edgeList){
        parent.edgeList = parent.edgeList.filter(item => item.id !== id)
        this.viewModel.set(parent.id,parent)
      }
      if (parent.edgeIfEmpty){
        parent.edgeIfEmpty = parent.edgeIfEmpty.filter(item => item.id !== id)
      }
    }

    // let parent = this.viewModel.get(node.parent);
    // console.log('PARENT', node)

    return this.viewModel.delete(id);
  }

  convertModel() {
    this.model = []
    const viewArray = [...this.viewModel.values()]
    viewArray.forEach((node) => {
      let newNode: Node
      switch(node.type) {
        case NodeType.BranchNode: {
          let branchProps = new BranchProps();
          node.props.forEach((prop) => {
            switch(prop.name) {
              case Strings.TEXT_FOR_SYNTHESIZE: {
                branchProps.synthText = prop.value
                break
              }
              case Strings.ASR_OPTION: {
                branchProps.asrOptions = prop.value
                break
              }
              case Strings.ASR_TYPE: {
                if(prop.value.selected === Strings.BUILTIN_GRAMMAR) {
                  branchProps.grammar = 'http://localhost/theme:graph'
                  break
                }
              }
              case Strings.GRAMMAR: {
                if (prop.value.selected === Strings.FILE_GRAMMAR) {
                  branchProps.grammar = '/etc/asterisk/' + prop.value.selected
                  break
                }
              }
            }
          })
          let edgeList: Relation[] = []
          if (node.edgeList !== undefined && node.edgeList.length !== 0) {
            node.edgeList.forEach(edge => {
              let relation = new Relation(edge.id, edge.match);
              edgeList.push(relation)
            })
          }
          newNode = new BranchNode(node.id, branchProps, edgeList)
          this.model.push(newNode)
          break
        }

        case NodeType.SpecifierNode: {
          let specifierProps = new SpecifierProps()
          node.props.forEach((prop) => {
            switch(prop.name) {
              case Strings.TEXT_FOR_SYNTHESIZE: {
                specifierProps.synthText = prop.value
                break
              }
              case Strings.ASR_OPTION: {
                specifierProps.asrOptions = prop.value
                break
              }
              case Strings.ASR_TYPE: {
                if(prop.value.selected === Strings.BUILTIN_GRAMMAR) {
                  specifierProps.grammar = 'http://localhost/theme:graph'
                  break
                }
              }
              case Strings.GRAMMAR: {
                if (prop.value.selected === Strings.FILE_GRAMMAR) {
                  specifierProps.grammar = '/etc/asterisk/' + prop.value.selected
                  break
                }
              }
              case Strings.VAR_NAME: {
                specifierProps.varName = prop.value
                break
              }
              case Strings.KEYWORDS: {
                if(prop.value.length !== 0) {
                  specifierProps.match = prop.value
                }
                break
              }
            }
          })
          let edgeList: Relation[] = []
          let edgeIfEmpty: Relation[] = []
          if (node.edgeList !== undefined && node.edgeList.length !== 0) {
            let edge = new Relation(node.edgeList[0].id, node.edgeList[0].match);
            edgeList.push(edge)
          }
          if (node.edgeIfEmpty !== undefined && node.edgeIfEmpty.length !== 0) {
            let edge = new Relation(node.edgeIfEmpty[0].id, node.edgeIfEmpty[0].match);
            edgeIfEmpty.push(edge)
          }
          newNode = new SpecifierNode(node.id, specifierProps, edgeList, edgeIfEmpty)
          this.model.push(newNode)
          break
        }
        case NodeType.EndNode: {
          let endProps = new EndProps()
          endProps.synthText = node.props[0].value
          newNode = new EndNode(node.id, endProps)
          this.model.push(newNode)
          break
        }
      }
    })
  }

  saveToJson() {
    this.convertModel();
    this._http.sendModel(this.model).subscribe((data: any) => { console.log('OPA') },
      error => console.log(error));
  }

  requestModel() {
    this._http.requestModel().subscribe((response: any) => {
      this.model = response
      this.buildViewModel()
      this._eventService._events.emit('updateModel');
    }, error => {
      // this.model = START_DATA;
      // this._eventService._events.emit("modelReceived")
    })
  }
}
