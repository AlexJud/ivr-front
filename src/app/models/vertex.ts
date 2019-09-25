import {NodeType} from './types';

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
  result: VertexResult = new VertexResult();
  state: VertexState = new VertexState();
  props: any;

  constructor() {}
}

class VertexState {
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


