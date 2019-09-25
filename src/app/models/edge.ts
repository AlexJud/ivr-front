import {Vertex} from "./vertex";

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
