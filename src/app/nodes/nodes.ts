export enum NodeType {
  ActionNode = "ActionNode",
  ClassifierNode = "ClassifierNode",
  ExtractNode = "ExtractNode",
  ValidateNode = "ValidateNode"
}

export abstract class Node {
  id: string;
  props: string[];
  children: Node[];
}

export class ActionNode extends Node {
  constructor(id: string, prop: string[], child: Node[]) {
    super();
    this.id = id;
    this.children = child;
    this.props = prop;
  }
}
export class ExtractNode extends Node {
  constructor() {
    super();
  }
}
export class ClassifierNode extends Node {
}
