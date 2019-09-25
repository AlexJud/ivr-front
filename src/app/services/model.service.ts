import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {EventService} from './event.service';
import {Vertex} from '../models/vertex';
import {Edge} from '../models/edge';
import {Events} from '../models/events';
import * as _ from 'lodash';
import {NodeType} from "../models/types";
import {GraphViewModel} from "../models/graph-v-model";

type ChildEdges = { child: Vertex, edge: Edge };

export interface TableView {
  optionsDataSource?: any[],
  optionTableView?: any,
}

@Injectable()
export class ModelService {


  private _model: Node[];
  // private asrTypes: string[];

  private sourceModel;
  public graphViewModel = new GraphViewModel(new Map<string, Vertex>(), new Map<string, Edge[]>());
  private counterNodeId = 0;
  private counterEdgeId = 0;
  private counterUservarId = 0;

  constructor(private _http: HttpService,
              private _eventService: EventService) {
    // this.asrTypes = ['Слитное распознавание', 'Распознавание по грамматике'];
  }

  get model(): Node[] {
    return this._model;
  }

  set model(model: Node[]) {
    this._model = model;
  }

  init() {

    let node = new Vertex(this.generateNodeId());
    node.type = NodeType.BranchNode;
    node.speech = 'Как дела?';
    this.graphViewModel.graph.set(node.id, node);

  }

  addEdgeToMap(parentId: string, edge: Edge, source: Map<string, Edge[]> = this.graphViewModel.edges) {
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
        _.pull(item, edge);
      } else if (vertex) {
        _.pullAllBy(item, [{child: vertex}], 'child');
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
      });

      vertex.child.forEach(child => {
        _.pull(child.parent, vertex);
      });
      this.deleteEdgeFromMap(vertex.id, null, null, true);

      this.graphViewModel.graph.delete(vertex.id);
      this.graphViewModel.events.emit(Events.noderemoved);
    } else {
      let edges = this.graphViewModel.edges.get(vertex.id)
      let edge = edges.find(item => item.id === edgeId)
      edge.child.parent.splice(edge.child.parent.indexOf(edge.parent), 1);
      edge.parent.child.splice(edge.parent.child.indexOf(edge.child), 1);

      this.deleteEdgeFromMap(edge.parent.id, edge)
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
    this.graphViewModel.events.emit(Events.edgeadded);
  }

  saveToJson() {
    let temp = this.convertToSourceModel(this.graphViewModel.graph);
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

    return {graph: resultMap, edges};
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


}
