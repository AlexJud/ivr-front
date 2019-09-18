import {EventEmitter} from 'events';
import {NodeType} from '../graph/nodes/nodes';
import * as _ from 'lodash';

export class GraphViewModel {
  graph: Map<string, Vertex>;
  state: any;
  events: EventEmitter;

  constructor(graph: Map<string, Vertex>) {
    this.graph = graph;
    this.events = new EventEmitter();
    // this.state['graph'] = new GraphState()
    // this.state;
    // console.log('GRAPH CONSTR', this);
  }
}

// export class GraphState {
//   layout: string;
//   // layouts : any;
//
//   constructor() {
//     // this.layout = ;
//     // this.layouts = {}
//   }
// }



export class Vertex {
  id: string;
  title: string;
  type: string;
  parent: Vertex [] = [];
  child: Vertex [] = [];
  speech: string;
  props: VertexProperties;
  temp: any;

  constructor(id: string, type?: NodeType, parent?: Vertex, child?: Vertex) {
    this.id = id;
    this.type = type;

    if (parent) {
      this.parent.push(parent);
    }
    if (child) {
      this.child.push(child);
    }
    this.props = new VertexProperties();
  }


}

class VertexProperties {
  edges: Edge[] = [];
  result: VertexResult = new VertexResult();
  state: VertexState = new VertexState();
  props: any;

  constructor() {
    // this.state.errorEdge  = undefined
    // this.state.logicEdge = undefined
    // console.log('THIS> CONstr', this)
    // this.state.errorEdge = 1
  }
}

class VertexState {
  errorEdge:any;
  logicEdge:any;
  constructor(){}
}

class VertexResult {
  id: string;
  name: string;
  grammar: string;
  asrOptions: string;
  repeat: string;
  seek: string[] = [];


  constructor() {
  }
}

export class Edge {
  parent: Vertex;
  match: string[] = [];
  error: boolean = false;

  constructor(parent: Vertex, match: string[], isError: boolean = false) {
    this.parent = parent;
    this.match = match;
    this.error = isError;
  }
}
