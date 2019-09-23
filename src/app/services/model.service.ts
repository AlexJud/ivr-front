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
import {BranchProps} from '../graph/nodeProps/actionProps';
import {Edge, GraphViewModel, Vertex} from '../models/vertex';
import {Fakeget, FakeGet2} from './fake';
import {Events} from '../models/events';
import * as _ from 'lodash';

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

type ChildEdges = { child: Vertex, edge: Edge };

export interface TableView {
  optionsDataSource?: any[],
  optionTableView?: any,
}

@Injectable()
export class ModelService {


  private _model: Node[];
  private _viewModel = new Map<string, ViewNode>();
  private asrTypes: string[];

  private sourceModel;
  public graphViewModel = new GraphViewModel(new Map<string, Vertex>(), new Map<string, Edge[]>());
  private counterNodeId = 0;
  private counterEdgeId = 0;
  private counterUservarId = 0;

  constructor(private _http: HttpService,
              private _eventService: EventService) {
    this.asrTypes = ['Слитное распознавание', 'Распознавание по грамматике'];
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
    // this.model = START_DATA;
    // this.buildViewModel();

    let node = new Vertex(this.generateNodeId());
    node.type = NodeType.BranchNode;
    node.speech = 'Как дела?';
    this.graphViewModel.graph.set(node.id, node);

  }

  addEdgeToMap(parentId: string, edge: Edge, source:Map<string,Edge[]> = this.graphViewModel.edges) {
    if (edge && parentId) {
      let item = source.get(parentId);
      if (item) {
        item.push(edge);
        source.set(parentId, item);
      } else {
        source.set(parentId, [edge]);
      }
    }
  }

  deleteEdgeFromMap(parentId: string, edge?: Edge, vertex?: Vertex, delKey: boolean = false) {
    console.log('delete edge from map', parentId, edge, vertex, delKey);
    let item = this.graphViewModel.edges.get(parentId);
    if (item) {
      if (delKey) {
        this.graphViewModel.edges.delete(parentId);
        return;
      }
      if (edge) {
        // console.log('TRACE 1', edge);
        _.pull(item, edge);
      } else if (vertex) {
        // console.log('TRACE 2', vertex);
        _.pullAllBy(item, [{child: vertex}], 'child');
        // console.log('TRACE 3', item);
      }
      if (item.length === 0) {
        this.graphViewModel.edges.delete(parentId);
      } else {
        this.graphViewModel.edges.set(parentId, item);
      }
    }
  }

  addVertex(vertex: Vertex, parentId: string, errorEdge: boolean = false) {
    // console.log('ADD NEW', vertex);
    if (!parentId) {
      console.error('Родитель не задан', vertex);
      return;
    }
    vertex.id = this.generateNodeId();

    let parent = this.graphViewModel.graph.get(parentId);
    vertex.parent.push(parent);
    let edge = new Edge(this.generateEdgeId(), parent, [], errorEdge, vertex);
    this.addEdgeToMap(edge.parent.id, edge);
    // vertex.props.edges.push(edge);
    parent.child.push(vertex);

    this.graphViewModel.graph.set(vertex.id, vertex);

    // if (errorEdge) {
    //   parent.props.state.errorEdge = vertex;
    // } else {
    //   parent.props.state.logicEdge = vertex;
    // }

    this.graphViewModel.events.emit(Events.nodeadded);
    // console.log('added ', this.graphViewModel.graph);
  }

  deleteVertex(vertexId: string, edgeId: string = undefined) {
    let vertex = this.graphViewModel.graph.get(vertexId);
    if (!vertex) {
      console.error('При удалении не неайден узел c ID:', vertexId, ' edgeId ', edgeId);
      return;
    }

    if (!edgeId) {


      vertex.parent.forEach(node => {
        _.pull(node.child, vertex);
        this.deleteEdgeFromMap(node.id, null, vertex);

        // console.log('NODE PARENT', node, 'CHILD', vertex);
        // if (node.props.state.logicEdge === vertex) {
        //   let edge = this.getChildEdges(node.id).find(item => item.edge.error === false);
        //   node.props.state.logicEdge = edge ? edge.child : null;
        // }
        // if (node.props.state.errorEdge === vertex) {
        //   let edge = this.getChildEdges(node.id).find(item => item.edge.error === true);
        //   node.props.state.errorEdge = edge ? edge.child : null;
        // }


      });

      vertex.child.forEach(child => {
        _.pull(child.parent, vertex);
        // let temp = Array.of(child.props.edges.find(edge => edge.parent.id === vertex.id));
        // child.props.edges = _.difference(child.props.edges, temp);
      });
      this.deleteEdgeFromMap(vertex.id, null, null, true);

      this.graphViewModel.graph.delete(vertex.id);
      this.graphViewModel.events.emit(Events.noderemoved);
    } else {
      // console.log('TRACE 2',vertexId)
      // let edge = vertex.props.edges.find(ed => ed.id === edgeId);
      let edges = this.graphViewModel.edges.get(vertex.id)
      let edge = edges.find(item => item.id === edgeId)
      // let node = edge.parent;
      // _.pull(node.child,vertex)
      // console.log('1====',node.child.splice(node.child.indexOf(vertex),node.child.indexOf(vertex)))
      // console.log('ARR',node.child)
      // console.log('2====',node.child.indexOf(vertex))
      edge.child.parent.splice(edge.child.parent.indexOf(edge.parent), 1);
      // _.remove(vertex.props.edges, edge => edge.id === edgeId);
      edge.parent.child.splice(edge.parent.child.indexOf(edge.child), 1);

      this.deleteEdgeFromMap(edge.parent.id, edge)

      // if (node.props.state.logicEdge === vertex && (!edge.error)) {
      //   console.log('TRACE 1', node.props.state.logicEdge);
      //   let edge = this.getChildEdges(node.id).find(item => item.edge.error === false);
      //   node.props.state.logicEdge = edge ? edge.child : null;
      // }
      // if (node.props.state.errorEdge === vertex && edge.error) {
      //   console.log('TRACE 2', node.props.state.errorEdge);
      //   let edge = this.getChildEdges(node.id).find(item => item.edge.error === true);
      //   node.props.state.errorEdge = edge ? edge.child : null;
      // }


      this.graphViewModel.events.emit(Events.edgeremoved);
    }
  }

  bindVertex(parentId, childId, isErrorLink: boolean) {
    let parent = this.graphViewModel.graph.get(parentId);
    let child = this.graphViewModel.graph.get(childId);

    parent.child.push(child);
    child.parent.push(parent);

    let edge = new Edge(this.generateEdgeId(), parent, [], isErrorLink, child);
    this.addEdgeToMap(edge.parent.id, edge);
    // child.props.edges.push(edge);
    // if (!parent.props.state.errorEdge && isErrorLink) {
    //   parent.props.state.errorEdge = child;
    // }
    // if (!parent.props.state.logicEdge && !isErrorLink) {
    //   parent.props.state.logicEdge = child;
    // }

    this.graphViewModel.events.emit(Events.edgeadded);
  }

  // getChildEdges(parentId): ChildEdges[] {
  //   let vertex = this.graphViewModel.graph.get(parentId);
  //   let edges = [];
  //   vertex.child.forEach(child => {
  //     let filter = child.props.edges.filter(edge => edge.parent.id === parentId);
  //     filter.forEach(elem => edges.push({child, edge: elem}));
  //
  //   });
  //   return edges;
  // }

  saveToJson() {
    let temp = this.convertToSourceModel(this.graphViewModel.graph);
    // this.convertModel();
    // console.log('SAVE MODEL', this.model);
    this._http.sendModel(temp).subscribe(
      (data: any) => {
        console.log('Saved Success');
        this.graphViewModel.events.emit(Events.savedsucces);
      },
      error => console.error('Error saved model: ', error));
  }

  requestModel() {
    this._http.requestModel().subscribe((response: any) => {
      this.counterNodeId = this.counterEdgeId = this.counterUservarId = 0;
      this.sourceModel = response;
      let result = this.convertToViewModel(response);
      this.graphViewModel.graph = result.graph;
      this.graphViewModel.edges = result.edges
      this.graphViewModel.events.emit(Events.loadedmodel);
    }, error => console.error('Error get model: ', error));
  }

  private generateNodeId() {
    const name = 'Node';
    if (this.graphViewModel.graph) {
      if (this.graphViewModel.graph.size === 0) {
        return 'root';
      } else {
        let index = this.counterNodeId;
        let node;
        do {
          node = this.graphViewModel.graph.get(name + index++);
        } while (node);
        this.counterNodeId = --index;
        return name + this.counterNodeId++;
      }
    }
  }

  private generateEdgeId() {
    return 'Edge' + this.counterEdgeId++;
  }

  private generateUservarId() {
    return 'UserVar' + this.counterUservarId++;
  }

  private convertToViewModel(json) {
    let map = new Map<string, Vertex>();
    let edges = new Map<string, Edge[]>();

    let array = Array.from(json);

    array.forEach((node: any) => {
      let vertex = new Vertex(node.id);
      vertex.type = node.type;
      vertex.props.props = node.props;
      if (node.type === NodeType.BranchNode || node.type === NodeType.SpecifierNode) {
        vertex.props.result.grammar = node.props.grammar;
        vertex.props.result.asrOptions = node.props.asrOptions;
        if (node.type === NodeType.SpecifierNode) {
          vertex.props.result.name = node.props.varName;
          vertex.props.result.seek = node.props.match;
        }
      }
      if (node.type === NodeType.SystemNode) {
        vertex.props.result.name = node.props.varName;
        vertex.props.result.id = node.props.systemVar;
      } else {
        vertex.speech = node.props.synthText;
      }
      vertex.temp = node;
      map.set(vertex.id, vertex);
    });

    array.forEach((node: any) => {
      let parent = map.get(node.id);

      if (node.edgeList) {
        node.edgeList.forEach(child => {
          let vert = map.get(child.id);
          if (!vert) {
            console.error('Узел не обраружен в словаре ', child.id);
          }
          let error = false;
          if ((child.match.length === 0) && (node.type !== NodeType.SpecifierNode)) {
            error = true;
          }
          let temp = new Edge(this.generateEdgeId(), parent, child.match, error, vert)
          console.log('EDGE CREATE ', temp)
          this.addEdgeToMap(node.id, temp, edges)
          vert.parent.push(parent);
          parent.child.push(vert);
        });
      }
      if (node.edgeIfEmpty) {
        node.edgeIfEmpty.forEach(child => {
          let vert = map.get(child.id);
          this.addEdgeToMap(node.id, new Edge(this.generateEdgeId(), parent, [], true, vert), edges);
          parent.child.push(vert);
          vert.parent.push(parent)
        });
      }


    });

    let resultMap = new Map<string, Vertex>();
    map.forEach((v, k) => resultMap.set(v.id, v));

    console.log('MAP', resultMap);
    // this.counterNodeId = array.length;
    // console.log('CURRENT ', this.counterNodeId);

    return {graph: resultMap,edges};
  }

  private convertToSourceModel(viewModel: Map<string, Vertex>) {
    let target = [];

    viewModel.forEach(item => {

      let node = {
        id: item.id,
        type: item.type,
        props: {},
      };

      switch (item.type) {
        case NodeType.BranchNode:
          node.props['synthText'] = item.speech || '';
          // node.props['grammar'] = item.props.result.grammar;
          node.props['grammar'] = 'http://localhost/theme:graph';
          node.props['asrOptions'] = item.props.result.asrOptions || '';
          node['edgeList'] = [];
          break;

        case NodeType.SpecifierNode:
          node.props['synthText'] = item.speech || '';
          node.props['varName'] = item.props.result.name || '';
          node.props['repeatMax'] = item.props.result.repeat || '';
          node.props['match'] = item.props.result.seek || '';
          // node.props['grammar'] = item.props.result.grammar;
          node.props['grammar'] = 'http://localhost/theme:graph';
          node.props['asrOptions'] = item.props.result.asrOptions || '';
          node['edgeList'] = [];
          node['edgeIfEmpty'] = [];
          break;

        case NodeType.SystemNode:
          node.props['varName'] = item.props.result.name || '';
          node.props['systemVar'] = item.props.result.sysname || '';
          node['edgeList'] = [];
          break;

        case NodeType.EndNode:
          node.props['synthText'] = item.speech || '';
          break;
      }

      target.push(node);
    });

    // this.graphViewModel.edges.forEach((value, key) => {
    //   value.forEach(edge => {
    //       let parent = target.find(par => par.id === edge.parent.id);
    //       if (edge.error) {
    //         if (parent['edgeIfEmpty']) {
    //           parent['edgeIfEmpty'].push({id: rel.id, match: edge.match});
    //         } else {
    //           parent['edgeList'].push({id: rel.id, match: edge.match});
    //         }
    //       } else {
    //         parent['edgeList'].push({id: rel.id, match: edge.match});
    //       }
    //     });
    // });

    this.graphViewModel.edges.forEach((value, key) => {
      value.forEach(edge => {
        let parent = target.find(item => item.id === key)
        if (edge.error) {
          if (parent['edgeIfEmpty']) {
            parent['edgeIfEmpty'].push({id: edge.child.id, match: edge.match});
          } else {
            parent['edgeList'].push({id: edge.child.id, match: edge.match});
          }
        } else {
          parent['edgeList'].push({id: edge.child.id, match: edge.match});
        }
      })
    })

    console.log('SAVE MODEL', target);
    return target;

  }

  // buildViewModel() {
  //   this.model.forEach(node => {
  //     switch (node.type) {
  //       case NodeType.BranchNode: {
  //         this._viewModel.set(node.id, BranchViewNode.createFromNode(node));
  //         break;
  //       }
  //       case NodeType.ClassifierNode: {
  //         // this._viewModel.set(node.id, ClassifierViewNode.createFromNode(node))
  //         break;
  //       }
  //       case NodeType.SpecifierNode: {
  //         this._viewModel.set(node.id, SpecifierViewNode.createFromNode(node));
  //         break;
  //       }
  //       case NodeType.EndNode: {
  //         this._viewModel.set(node.id, EndViewNode.createFromNode(node));
  //         break;
  //       }
  //     }
  //   });
  //   this.setParents();
  //   console.log(this.viewModel);
  // }
  //
  // private setParents() {
  //   this._viewModel.forEach(node => {
  //     let parentId = node.id;
  //     if (node.edgeIfEmpty !== undefined) {
  //       node.edgeList.forEach(edge => {
  //         this._viewModel.get(edge.id).parent = parentId;
  //       });
  //     }
  //     if (node.edgeIfEmpty !== undefined) {
  //       node.edgeIfEmpty.forEach(edge => {
  //         this._viewModel.get(edge.id).parent = parentId;
  //       });
  //     }
  //   });
  // }

  // addNewViewNode(id: string, type: string, parent: string, error: boolean = false) {
  //   switch (type) {
  //     case NodeType.BranchNode: {
  //       console.log('TRACE1');
  //       this._viewModel.set(id, BranchViewNode.createNewNode(id, type, parent));
  //       console.log('map', this._viewModel.get(id));
  //       break;
  //     }
  //     case NodeType.SystemNode: {
  //       this._viewModel.set(id, SystemViewNode.createNewNode(id, type, parent));
  //       break;
  //     }
  //     case NodeType.SpecifierNode: {
  //       this._viewModel.set(id, SpecifierViewNode.createNewNode(id, type, parent));
  //       break;
  //     }
  //     case NodeType.EndNode: {
  //       this._viewModel.set(id, EndViewNode.createNewNode(id, type, parent));
  //       break;
  //     }
  //   }
  //   this.addChildrenToParent(id, parent, error);
  //   console.log('viewModel ', this.viewModel);
  // }

  // deleteViewNode(id: string, root?) {
  //   let node = this.viewModel.get(id);
  //   if (node.edgeIfEmpty) {
  //     for (let rec in node.edgeIfEmpty) {
  //       this.deleteViewNode(node.edgeIfEmpty[rec].id, id);
  //     }
  //   }
  //   if (node.edgeList) {
  //     for (let rec in node.edgeList) {
  //       this.deleteViewNode(node.edgeList[rec].id, id);
  //     }
  //   }
  //
  //   if (!root) {
  //     let parent = this.viewModel.get(node.parent);
  //     if (parent.edgeList) {
  //       parent.edgeList = parent.edgeList.filter(item => item.id !== id);
  //       this.viewModel.set(parent.id, parent);
  //     }
  //     if (parent.edgeIfEmpty) {
  //       parent.edgeIfEmpty = parent.edgeIfEmpty.filter(item => item.id !== id);
  //     }
  //   }
  //
  //   // let parent = this.viewModel.get(node.parent);
  //   // console.log('PARENT', node)
  //
  //   return this.viewModel.delete(id);
  // }

  // convertModel() {
  //   this.model = [];
  //   const viewArray = [...this.viewModel.values()];
  //   viewArray.forEach((node) => {
  //     let newNode: Node;
  //     switch (node.type) {
  //       case NodeType.BranchNode: {
  //         let branchProps = new BranchProps();
  //         node.props.forEach((prop) => {
  //           switch (prop.name) {
  //             case Strings.TEXT_FOR_SYNTHESIZE: {
  //               branchProps.synthText = prop.value;
  //               break;
  //             }
  //             case Strings.ASR_OPTION: {
  //               branchProps.asrOptions = prop.value;
  //               break;
  //             }
  //             case Strings.ASR_TYPE: {
  //               if (prop.value.selected === Strings.BUILTIN_GRAMMAR) {
  //                 branchProps.grammar = 'http://localhost/theme:graph';
  //                 break;
  //               }
  //             }
  //             case Strings.GRAMMAR: {
  //               if (prop.value.selected === Strings.FILE_GRAMMAR) {
  //                 branchProps.grammar = '/etc/asterisk/' + prop.value.selected;
  //                 break;
  //               }
  //             }
  //           }
  //         });
  //         let edgeList: Relation[] = [];
  //         if (node.edgeList !== undefined && node.edgeList.length !== 0) {
  //           node.edgeList.forEach(edge => {
  //             let relation = new Relation(edge.id, edge.match);
  //             edgeList.push(relation);
  //           });
  //         }
  //         newNode = new BranchNode(node.id, branchProps, edgeList);
  //         this.model.push(newNode);
  //         break;
  //       }
  //
  //       case NodeType.SpecifierNode: {
  //         let specifierProps = new SpecifierProps();
  //         node.props.forEach((prop) => {
  //           switch (prop.name) {
  //             case Strings.TEXT_FOR_SYNTHESIZE: {
  //               specifierProps.synthText = prop.value;
  //               break;
  //             }
  //             case Strings.ASR_OPTION: {
  //               specifierProps.asrOptions = prop.value;
  //               break;
  //             }
  //             case Strings.ASR_TYPE: {
  //               if (prop.value.selected === Strings.BUILTIN_GRAMMAR) {
  //                 specifierProps.grammar = 'http://localhost/theme:graph';
  //                 break;
  //               }
  //             }
  //             case Strings.GRAMMAR: {
  //               if (prop.value.selected === Strings.FILE_GRAMMAR) {
  //                 specifierProps.grammar = '/etc/asterisk/' + prop.value.selected;
  //                 break;
  //               }
  //             }
  //             case Strings.VAR_NAME: {
  //               specifierProps.varName = prop.value;
  //               break;
  //             }
  //             case Strings.KEYWORDS: {
  //               if (prop.value.length !== 0) {
  //                 specifierProps.match = prop.value;
  //               }
  //               break;
  //             }
  //           }
  //         });
  //         let edgeList: Relation[] = [];
  //         let edgeIfEmpty: Relation[] = [];
  //         if (node.edgeList !== undefined && node.edgeList.length !== 0) {
  //           let edge = new Relation(node.edgeList[0].id, node.edgeList[0].match);
  //           edgeList.push(edge);
  //         }
  //         if (node.edgeIfEmpty !== undefined && node.edgeIfEmpty.length !== 0) {
  //           let edge = new Relation(node.edgeIfEmpty[0].id, node.edgeIfEmpty[0].match);
  //           edgeIfEmpty.push(edge);
  //         }
  //         newNode = new SpecifierNode(node.id, specifierProps, edgeList, edgeIfEmpty);
  //         this.model.push(newNode);
  //         break;
  //       }
  //       case NodeType.EndNode: {
  //         let endProps = new EndProps();
  //         endProps.synthText = node.props[0].value;
  //         newNode = new EndNode(node.id, endProps);
  //         this.model.push(newNode);
  //         break;
  //       }
  //     }
  //   });
  // }


}
