import { Relation } from './relation';
import { ExtractProps } from '../nodeProps/extractProps';
import { ValidateProps } from '../nodeProps/validateProps';
import { SpecifierProps } from '../nodeProps/specifierProps';

export enum NodeType {
  ActionNode = "ActionNode",
  ClassifierNode = "ClassifierNode",
  ExtractNode = "ExtractNode",
  ValidateNode = "ValidateNode",
  SpecifierNode = "SpecifierNode",
  EndNode = "EndNode"
}

export abstract class Node {
  id: string;
  edgeList: Relation[];
  props?: any;
}

export class ActionNode extends Node {
  props: string[];
  type: string = 'ACTION';
  constructor(id: string, prop: string[], child: Relation[]) {
    super();
    this.id = id;
    this.props = prop;
    this.edgeList = child;
  }
}
export class ExtractNode extends Node {
  props: ExtractProps;
  type: string = 'EXTRACT';
  constructor(id: string, prop: ExtractProps, child: Relation[]) {
    super();
    this.id = id;
    this.edgeList = child;
    this.props = prop;
  }
}
export class ClassifierNode extends Node {
  type: string = 'CLASSIFIER';
  constructor(id: string, child: Relation[]) {
    super();
    this.id = id;
    this.edgeList = child;
  }
}
export class ValidateNode extends Node {
  props: ValidateProps;
  type: string = 'VALIDATE';
  constructor(id: string, props: ValidateProps) {
    super();
    this.id = id;
    this.props = props;
  }
}
export class SpecifierNode extends Node {
  props: SpecifierProps[];
  type: string = 'SPECIFIER';
  constructor(id: string, props: SpecifierProps[], child: Relation[]) {
    super();
    this.id = id;
    this.edgeList = child;
    this.props = props;
  }
}

export class EndNode extends Node {
  props: string[];
  type: string = "TRANSFER"
  constructor(id: string, prop: string[]) {
    super();
    this.id = id;
    this.props = prop;
  }
}
