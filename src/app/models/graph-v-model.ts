import {EventEmitter} from "events";
import { Vertex} from "./vertex";
import {Edge} from "./edge";

export class GraphViewModel {
  state: any;
  events: EventEmitter;

  constructor(public graph: Map<string, Vertex>,public edges: Map<string,Edge[]>) {
    this.events = new EventEmitter();
  }
}
