import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {EventService} from './event.service';
import {Vertex} from '../models/vertex';
import {Edge, EdgeVariable} from '../models/edge';
import {Events} from '../models/events';
import * as _ from 'lodash';
import {NodeType} from '../models/types';
import {GraphViewModel} from '../models/graph-v-model';
import {range} from 'rxjs';
import {map} from 'rxjs/operators';
import {MRCP} from '../components/enums/MRCPoptions';

type ChildEdges = { child: Vertex, edge: Edge };

export interface TableView {
  optionsDataSource?: any[],
  optionTableView?: any,
}

@Injectable()
export class ModelService {

  public mrcpOptions = MRCP;

  private sourceModel;
  public graphViewModel = new GraphViewModel(new Map<string, Vertex>(), new Map<string, Edge[]>());
  public user = 'demoUser' + Math.floor(Math.random() * 100000);

  private counterNodeId = 0;
  private counterEdgeId = 0;
  private counterUservarId = 0;

  constructor(private _http: HttpService,
              private _eventService: EventService) {
    // this.asrTypes = ['Слитное распознавание', 'Распознавание по грамматике'];
  }

  init() {

    let node = new Vertex(this.generateNodeId());
    node.type = NodeType.BranchNode;
    node.speech = 'Как дела?';
    this.graphViewModel.graph.set(node.id, node);

    this.testMethod();
  }

  testMethod() {

    range(1, 3).pipe(
      map(x => range(1, 3))
    )
      .subscribe(s => console.log('ss', s));

    // merge(interval(1000),of(1,2,4))
    //   .pipe(take(5))
    //   .subscribe(
    //   x => console.log('x .',x),
    //   ()=> console.error('ERROR'),
    //   ()=> console.log('COMPLITE'))
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

  // add 1 Edge to many parents
  addVertex(vertex: Vertex, parentsId: string[], errorEdge: boolean = false) {
    // console.log('ADD NEW 1', vertex);
    // console.log('ADD NEW 2', parentsId);
    // console.log('ADD NEW 3', errorEdge);

    if (parentsId.length === 0) {
      console.error('Родитель не задан', vertex);
      return;
    }
    vertex.id = this.generateNodeId();
    let id = this.generateEdgeId();
    let arr = [];
    let vary = new EdgeVariable();

    parentsId.forEach(parentId => {
      let parent = this.graphViewModel.graph.get(parentId);
      vertex.parent.push(parent);
      let edge = new Edge(id, parent, arr, errorEdge, vertex, vary);
      this.addEdgeToMap(edge.parent.id, edge);
      // vertex.props.edges.push(edge);
      parent.child.push(vertex);
    });
    this.graphViewModel.graph.set(vertex.id, vertex);

    // if (errorEdge) {
    //   parent.props.state.errorEdge = vertex;
    // } else {
    //   parent.props.state.logicEdge = vertex;
    // }

    this.graphViewModel.events.emit(Events.nodeadded);
    // console.log('added ', this.graphViewModel.graph);
  }

  deleteVertex(vertexId: string) {
    let vertex = this.graphViewModel.graph.get(vertexId);
    if (!vertex) {
      console.error('При удалении не неайден узел c ID:', vertexId);
      return;
    }

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
  }

  deleteEdges(parentsId: string[], edgeId: string[]) {
    console.log('PARENTS ', parentsId, ' EDGES ', edgeId);
    parentsId.forEach(vertex => {
      let edges = this.graphViewModel.edges.get(vertex);
      edgeId.forEach(rec => {
        let edge = edges.find(item => item.id === rec);
        if (edge) {
          edge.child.parent.splice(edge.child.parent.indexOf(edge.parent), 1);
          edge.parent.child.splice(edge.parent.child.indexOf(edge.child), 1);
          this.deleteEdgeFromMap(edge.parent.id, edge);
        }

      });

    });

    this.graphViewModel.events.emit(Events.edgeremoved);
  }

  copyEdges(parentId, targetId, edgesId: string[]) {
    console.log('TRACE COPY 1', parentId);
    console.log('TRACE COPY 2', targetId);
    console.log('TRACE COPY 3', edgesId);
    let edges = this.graphViewModel.edges.get(parentId);
    edges = edges.filter(edge => edgesId.findIndex(rec => rec === edge.id) > -1);
    console.log('EDGEs FIDTERED ', edges);

    let array = [];
    let target = this.graphViewModel.graph.get(targetId);
    console.log('TRACE 2324234234');
    edges.forEach(edge => {
      let newEdge = new Edge(edge.id, target, edge.match, edge.error, edge.child, edge.variable);
      if (!edge.error) {
        array.push(newEdge);
      }
      target.child.push(edge.child);
      edge.child.parent.push(target);
    });

    let edges1 = this.graphViewModel.edges.get(targetId);
    if (!edges1) {
      edges1 = [];
    }
    edges1 = _.concat(edges1, array);
    this.graphViewModel.edges.set(targetId, edges1);
    // console.log('TRACE 33', array)

    this.graphViewModel.events.emit(Events.edgeadded);
  }

  bindVertex(parentId, childId, isErrorLink: boolean) {
    let parent = this.graphViewModel.graph.get(parentId);
    let child = this.graphViewModel.graph.get(childId);

    parent.child.push(child);
    child.parent.push(parent);

    let edge = new Edge(this.generateEdgeId(), parent, [], isErrorLink, child, new EdgeVariable());
    this.addEdgeToMap(edge.parent.id, edge);
    this.graphViewModel.events.emit(Events.edgeadded);
  }

  saveToJson(filename, call: boolean = false) {
    let temp = this.convertToSourceModel(this.graphViewModel.graph);

    this._http.sendModel(temp, filename, call,this.user).subscribe(
      (data: any) => {
        console.log('Saved Success');
        this.graphViewModel.events.emit(Events.savedsucces);
      },
      error => console.error('Error saved model: ', error));
  }

  requestModel(filename) {
    this._http.requestModel(filename, this.user).subscribe((response: any) => {
      this.counterNodeId = this.counterEdgeId = this.counterUservarId = 0;
      this.sourceModel = response;
      let result = this.convertToViewModel(response);
      this.graphViewModel.graph = result.graph;
      this.graphViewModel.edges = result.edges;
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

  parseOptions(string: string) {
    if (string.indexOf('&') > -1) {
      let strings = string.split('&');
      strings.forEach(opt => {
        let arrData = opt.split('=');
        let record = this.mrcpOptions.find(param => param.name === arrData[0]);
        record.value = arrData[1];
      });
    }
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
          let temp = new Edge(this.generateEdgeId(), parent, child.match, error, vert, new EdgeVariable());
          temp.variable.name = child.name;
          console.log('EDGE CREATE ', temp);
          this.addEdgeToMap(node.id, temp, edges);
          vert.parent.push(parent);
          parent.child.push(vert);
        });
      }
      if (node.edgeIfEmpty) {
        node.edgeIfEmpty.forEach(child => {
          let vert = map.get(child.id);
          this.addEdgeToMap(node.id, new Edge(this.generateEdgeId(), parent, [], true, vert, new EdgeVariable()), edges);
          parent.child.push(vert);
          vert.parent.push(parent);
        });
      }

      this.parseOptions(map.get('root').props.result.asrOptions);

    });

    let resultMap = new Map<string, Vertex>();
    map.forEach((v, k) => resultMap.set(v.id, v));

    console.log('MAP', resultMap);

    return {graph: resultMap, edges};
  }

  private convertToSourceModel(viewModel: Map<string, Vertex>) {
    let target = [];
    let opt = this.mrcpOptions
      .filter(elem => elem.value)
      .map(elem => {
        return elem.name + '=' + elem.value;
      }).join('&');
    console.log('OPTIONS ', opt);

    viewModel.forEach(item => {

      let node = {
        id: item.id,
        type: item.type,
        props: {
          synthText: item.speech || '',
          // grammar: item.props.result.grammar || 'http://localhost/theme:graph, b=0&t=5000&nit=5000',
          grammar: item.props.result.grammar || 'http://localhost/theme:graph',
          asrOptions: opt,
          command: '',
          options: ''
        },
        edgeList: []
      };

      switch (item.type) {
        case NodeType.BranchNode:
          break;
        //
        // case NodeType.SpecifierNode:
        //   break;

        case NodeType.SystemNode:
          node.props.command = item.props.result.command;
          node.props.options = item.props.result.options;
          break;

        case NodeType.EndNode:
          break;
      }

      target.push(node);
    });

    this.graphViewModel.edges.forEach((value, key) => {
      value.forEach(edge => {
        let parent = target.find(item => item.id === key);
        // if (edge.error) {
        //   if (parent['edgeIfEmpty']) {
        //     parent['edgeIfEmpty'].push({id: edge.child.id, match: edge.match});
        //   } else {
        //     parent['edgeList'].push({id: edge.child.id, match: edge.match, name:'test'});
        //   }
        // } else {
        parent['edgeList'].push({id: edge.child.id, match: edge.match, name: edge.variable.name});
        // }

      });
    });

    console.log('SAVE MODEL', target);
    return target;

  }


}
