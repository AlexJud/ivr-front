import { Injectable } from '@angular/core';
import { Node, NodeType, SpecifierNode, EndNode, BranchNode } from '../graph/nodes/nodes';
import { Relation } from '../graph/nodes/relation';
import { HttpService } from './http.service';
import { SpecifierProps } from '../graph/nodeProps/specifierProps';
import { EventService } from './event.service';
import { ViewNode } from '../view-model-nodes/viewNode';
import { BranchViewNode } from '../view-model-nodes/branchViewNode/branchViewNode';
import { Strings, CellType } from '../graph/nodeProps/optionStrings';
import { GrammarService } from './grammar.service';
import { EndProps } from '../graph/nodeProps/endProps';
import { SpecifierViewNode } from '../view-model-nodes/specifierViewNode/specifierViewNode';
import { EndViewNode } from '../view-model-nodes/endViewNode/endViewNode';
import { SystemViewNode } from '../view-model-nodes/systemViewNode/systemViewNode';

const START_DATA = [
  new BranchNode('root', {synthText:'Здравствуй, дружочек! Чего желаешь?', grammar: 'http://localhost/theme:graph', options: 'b=1&t=5000&nit=5000'}),
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
      switch(node.type) {
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
  console.log(this.viewModel);
  }

  addNewViewNode(id: string, type: string, parent:string) {
    switch(type) {
      case NodeType.BranchNode: {
        this._viewModel.set(id, BranchViewNode.createNewNode(id, type, parent));   
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
    this.addChildrenToParent(id, parent)
  }

  addChildrenToParent(child: string, parent: string) {
    this.viewModel.get(parent).addChildren(child)
  }

  deleteViewNode(id: string) {
    this.viewModel.delete(id)
  }

  // convertModel() {
  //   this.model = []
  //   const viewArray = [...this.viewModel.values()]
  //   viewArray.forEach((node) => {
  //     let newNode: Node
  //     switch(node.type) {
  //       case NodeType.BranchNode: {
  //         let actionProps = new BranchNode();
  //         node.props.forEach((prop) => {
  //           switch(prop.name) {
  //             case Strings.TEXT_FOR_SYNTHESIZE: {
  //               actionProps.synthText = prop.value
  //               break
  //             }
  //             case Strings.ASR_OPTION: {
  //               actionProps.options = prop.value
  //               break
  //             }
  //             case Strings.ASR_TYPE: {
  //               if(prop.value.selected === Strings.BUILTIN_GRAMMAR) {
  //                 actionProps.grammar = 'http://localhost/theme:graph'
  //                 break
  //               }
  //             }
  //             case Strings.GRAMMAR: {
  //               if (prop.value.selected === Strings.FILE_GRAMMAR) {
  //                 actionProps.grammar = '/etc/asterisk/' + prop.value.selected
  //                 break
  //               }
  //             }
  //           }
  //         })
  //         // let edgeList: Relation[] = []
  //         // node.edgeList.forEach((child) => {
  //         //   edgeList.push(new Relation(child.id))
  //         // })
  //         newNode = new ActionNode(node.id, actionProps, node.edgeList)
  //         this.model.push(newNode)
  //         break
  //       }

  //       case NodeType.ClassifierNode: {
  //         // let edgeList: Relation[] = []
  //         // node.edgeList.forEach((child) => {
  //         //   edgeList.push(new Relation(child.id, child.match.split(',')))
  //         // })
  //         newNode = new ClassifierNode(node.id, node.edgeList)
  //         this.model.push(newNode)
  //         break
  //       }

  //       case NodeType.SpecifierNode: {
  //         let specifierPropsArray: SpecifierProps[] = []
  //         node.props.forEach((prop) => {
  //           let specifierProps = new SpecifierProps()
  //           specifierProps.varName = prop.varName
  //           specifierProps.synthText = prop.synthText
  //           specifierProps.asrOptions = prop.asrOptions
  //           if(prop.asrType.selected === Strings.BUILTIN_GRAMMAR) {
  //             specifierProps.grammar = 'http://localhost/theme:graph'
  //           } else {
  //             specifierProps.grammar = prop.grammar.value.selected
  //           }
  //           specifierProps.match = prop.keywords.split(',')
  //           specifierPropsArray.push(specifierProps)
  //         })
  //         // let edgeList: Relation[] = []
  //         // node.edgeList.forEach((child) => {
  //         //   edgeList.push(new Relation(child.id))
  //         // })
  //         newNode = new SpecifierNode(node.id, specifierPropsArray, node.edgeList)
  //         this.model.push(newNode)
  //         break
  //       }
  //       case NodeType.EndNode: {
  //         let endProps = new EndProps()
  //         endProps.synthText = node.props[0].value
  //         newNode = new EndNode(node.id, endProps)
  //         this.model.push(newNode)
  //         break
  //       }
  //     }
  //   })
  // }

  // saveToJson() {
  //   this.convertModel();
  //   this._http.sendModel(this.model).subscribe((data: any) => { console.log('OPA') },
  //     error => console.log(error));
  // }

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
