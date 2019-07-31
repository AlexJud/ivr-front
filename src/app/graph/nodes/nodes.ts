import { Relation } from './relation';
import { ExtractProps } from '../nodeProps/extractProps';
import { ValidateProps } from '../nodeProps/validateProps';
import { SpecifierProps } from '../nodeProps/specifierProps';
import { ActionProps } from '../nodeProps/actionProps';
import { EndProps } from '../nodeProps/endProps';

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
  type?:string;
  edgeList: Relation[];
  props?: any;
}

export class ActionNode extends Node {
  props: ActionProps;
  type: NodeType = NodeType.ActionNode;
  constructor(id: string, prop: ActionProps, child?: Relation[]) {
    super();
    this.id = id;
    this.props = prop;
    this.edgeList = child;
  }
}
export class ExtractNode extends Node {
  props: ExtractProps;
  type: NodeType = NodeType.ExtractNode;
  constructor(id: string, prop: ExtractProps, child: Relation[]) {
    super();
    this.id = id;
    this.edgeList = child;
    this.props = prop;
  }
}
export class ClassifierNode extends Node {
  type: NodeType = NodeType.ClassifierNode;
  constructor(id: string, child: Relation[]) {
    super();
    this.id = id;
    this.edgeList = child;
  }
}
export class ValidateNode extends Node {
  props: ValidateProps;
  type: NodeType = NodeType.ValidateNode;
  constructor(id: string, props: ValidateProps) {
    super();
    this.id = id;
    this.props = props;
  }
}
export class SpecifierNode extends Node {
  props: SpecifierProps[];
  type: NodeType = NodeType.SpecifierNode;
  constructor(id: string, props: SpecifierProps[], child: Relation[]) {
    super();
    this.id = id;
    this.edgeList = child;
    this.props = props;
  }
}

export class EndNode extends Node {
  props: EndProps;
  type: NodeType = NodeType.EndNode;
  constructor(id: string, prop: EndProps) {
    super();
    this.id = id;
    this.props = prop;
  }
}
