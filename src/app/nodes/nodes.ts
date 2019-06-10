export enum NodeType {
  ActionNode = "ActionNode",
  ClassifierNode = "ClassifierNode",
  ExtractNode = "ExtractNode",
  ValidateNode = "ValidateNode"
}

export abstract class Node {
  id: string;
  props: string[];
  children: string[];
}

export class ActionNode extends Node {
  constructor(id: string, prop: string[], child: string[]) {
    super();
    this.id = id;
    this.props = prop;
    this.children = child;
  }
}
export class ExtractNode extends Node {
  match: string[];
  constructor(id: string, prop: string[], child: string[]) {
    super();
    this.id = id;
    this.children = child;
  }
}
export class ClassifierNode extends Node {
  constructor(id: string, child: string[]) {
    super();
    this.id = id;
    this.children = child;

  }
}
