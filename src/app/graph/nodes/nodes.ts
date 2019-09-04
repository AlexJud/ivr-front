import { Relation } from './relation';
import { ExtractProps } from '../nodeProps/extractProps';
import { ValidateProps } from '../nodeProps/validateProps';
import { SpecifierProps } from '../nodeProps/specifierProps';
import { BranchProps } from '../nodeProps/actionProps';
import { EndProps } from '../nodeProps/endProps';
import { SystemProps } from '../nodeProps/systemProps';

export enum NodeType {
  BranchNode = "BranchNode",
  ClassifierNode = "ClassifierNode",
  SystemNode = "SystemNode",
  SpecifierNode = "SpecifierNode",
  EndNode = "EndNode"
}

export abstract class Node {
  id: string;
  type?:string;
  edgeList: Relation[];
  props?: any;
}

export class BranchNode extends Node {
  props: BranchProps;
  type: NodeType = NodeType.BranchNode;
  constructor(id: string, prop: BranchProps, child?: Relation[]) {
    super();
    this.id = id;
    this.props = prop;
    this.edgeList = child;
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

export class SystemNode extends Node {
  props: SystemProps;
  type: NodeType = NodeType.EndNode;
  constructor(id: string, prop: SystemProps) {
    super();
    this.id = id;
    this.props = prop;
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
