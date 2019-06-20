import { Relation } from './relation';
import { ExtractProps } from '../nodeProps/extractProps';
import { ValidateProps } from '../nodeProps/validateProps';
import { SpecifierProps } from '../nodeProps/specifierProps';

export enum NodeType {
  ActionNode = "ActionNode",
  ClassifierNode = "ClassifierNode",
  ExtractNode = "ExtractNode",
  ValidateNode = "ValidateNode",
  SpecifierNode = "SpecifierNode"
}

export abstract class Node {
  id: string;
  children: Relation[];
  props?: any;
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
  constructor(id: string, prop: ExtractProps, child: Relation[]) {
    super();
    this.id = id;
    this.children = child;
    this.props = prop;
  }
}
export class ClassifierNode extends Node {
  constructor(id: string, child: Relation[]) {
    super();
    this.id = id;
    this.children = child;
  }
}
export class ValidateNode extends Node {
  props: ValidateProps;
  constructor(id: string, child: Relation[]) {
    super();
    this.id = id;
    this.children = child;
  }
}
export class SpecifierNode extends Node {
  props: SpecifierProps;
  constructor(id: string, props, child: Relation[]) {
    super();
    this.id = id;
    this.children = child;
    this.props = props;
  }
}
