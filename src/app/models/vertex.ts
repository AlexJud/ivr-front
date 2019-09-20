import {EventEmitter} from 'events';
import {NodeType} from '../graph/nodes/nodes';
import * as _ from 'lodash';

export class GraphViewModel {
  graph: Map<string, Vertex>;
  edges: Map<string,Edge[]> =new Map<string, Edge[]>()
  state: any//GraphState = new GraphState();
  events: EventEmitter;

  constructor(graph: Map<string, Vertex>) {
    this.graph = graph;
    this.events = new EventEmitter();
    // console.log('G',this)
  }
}

// class GraphState{
//   userVars:VertexResult[]=[]
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

  constructor() {}
}

class VertexState {
  // errorEdge:any;
  // logicEdge:any;
  constructor(){}
}

export class VertexResult {
  id: string;
  sysname:string
  name: string;
  grammar: string;
  asrOptions: string;
  repeat: string;
  seek: string[] = [];

  constructor() {  }
}

export class Edge {
  id:string
  parent: Vertex;
  match: string[] = [];
  error: boolean = false;
  child: Vertex;

  constructor(id: string, parent: Vertex, match: string[], isError: boolean = false, child:Vertex) {
    this.parent = parent;
    this.match = match;
    this.error = isError;
    this.id = id;
    this.child = child
  }
}
