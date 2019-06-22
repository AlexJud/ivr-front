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
  type: string = 'ACTION';
  constructor(id: string, prop: string[], child: Relation[]) {
    super();
    this.id = id;
    this.props = prop;
    this.children = child;
  }
}
export class ExtractNode extends Node {
  props: ExtractProps;
  type: string = 'EXTRACT';
  constructor(id: string, prop: ExtractProps, child: Relation[]) {
    super();
    this.id = id;
    this.children = child;
    this.props = prop;
  }
}
export class ClassifierNode extends Node {
  type: string = 'CLASSIFIER';
  constructor(id: string, child: Relation[]) {
    super();
    this.id = id;
    this.children = child;
  }
}
export class ValidateNode extends Node {
  props: ValidateProps;
  type: string = 'VALIDATE';
  constructor(id: string, child: Relation[]) {
    super();
    this.id = id;
    this.children = child;
  }
}
export class SpecifierNode extends Node {
  props: SpecifierProps;
  type: string = 'SPECIFIER';
  constructor(id: string, props, child: Relation[]) {
    super();
    this.id = id;
    this.children = child;
    this.props = props;
  }
}
