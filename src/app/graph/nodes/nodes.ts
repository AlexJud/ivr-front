import { Relation } from './relation';
import { ExtractProps } from '../nodeProps/extractProps';
import { ValidateProps } from '../nodeProps/validateProps';

export enum NodeType {
  ActionNode = "ActionNode",
  ClassifierNode = "ClassifierNode",
  ExtractNode = "ExtractNode",
  ValidateNode = "ValidateNode"
}

export abstract class Node {
  id: string;
  children: Relation[];
  props: any;
}

export class ActionNode extends Node {
  props: string[];
  constructor(id: string, prop: string[], child: Relation[]) {
    super();
    this.id = id;
    this.props = prop;
    this.children = child;
  }
}
export class ExtractNode extends Node {
  props: ExtractProps;
  constructor(id: string, prop: string[], child: Relation[]) {
    super();
    this.id = id;
    this.children = child;
  }
}
export class ClassifierNode extends Node {
  constructor(id: string, child: Relation[]) {
    super();
    this.id = id;
    this.children = child;

  }
}

export class ValidateNode {
  props: ValidateProps;
}
