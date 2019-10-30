import {Vertex} from "./vertex";

export class Edge {
  id:string
  parent: Vertex;
  match: string[] = [];
  error: boolean = false;
  child: Vertex;
  variable: EdgeVariable = new EdgeVariable();

  constructor(id: string, parent: Vertex, match: string[], isError: boolean = false, child:Vertex, variable:EdgeVariable) {
    this.parent = parent;
    this.match = match;
    this.error = isError;
    this.id = id;
    this.child = child
    this.variable = variable;
  }
}

 export class EdgeVariable{
  name:string

}
