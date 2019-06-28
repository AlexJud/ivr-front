import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModelService } from './model.service';
import { NodeType, ActionNode, Node, ClassifierNode, ExtractNode, ValidateNode, SpecifierNode, EndNode } from '../graph/nodes/nodes';
import { Relation } from '../graph/nodes/relation';
import { ExtractProps } from '../graph/nodeProps/extractProps';
import { ValidateProps } from '../graph/nodeProps/validateProps';
import { EventService } from './event.service';

export class ItemNode {
  id: string;
  children?: ItemNode[];
  parent?: string;
  constructor(id: string, children?: ItemNode[], parent?: string) {
    this.id = id;
    this.children = children;
    this.parent = parent;
  }
}

export class FlatNode {
  id: string;
  level: number;
  expandable: boolean;
}

@Injectable()
export class BuildTreeService {
  parentNode: string;
  nodeType: string;
  dataChange = new BehaviorSubject<ItemNode[]>([]);

  get data(): ItemNode[] { return this.dataChange.value; }

  constructor(private _modelService: ModelService,
              private _eventService: EventService) {
    this.updateTree();
  }

  updateTree() {
    const data = this.buildTree();
    this.dataChange.next(data);
  }

  private buildTree(): ItemNode[] {
    let tree = [];
    this._modelService.model.map((node) => {
      if (node.props && node.edgeList) {
        tree.push(new ItemNode(node.id, [new ItemNode('Параметры', [], node.id), new ItemNode('Дочерние узлы', [], node.id)]));
      } else if (node.props && !node.edgeList) {
        tree.push(new ItemNode(node.id, [new ItemNode('Параметры', [], node.id)]));
      } else if (!node.props && node.edgeList){
        tree.push(new ItemNode(node.id, [new ItemNode('Дочерние узлы', [], node.id)]));
      }
    });
    console.log(tree);
    return tree as ItemNode[];
  }

  insertItem(node: ItemNode) {
    this.data.push(node);
    this.dataChange.next(this.data);
  }

  removeItem(node: ItemNode) {
    const index = this.data.indexOf(node);
 
    if (index > -1) {
       this.data.splice(index, 1);
    }
    this.dataChange.next(this.data);
  }
  addNodeToModel(id: string) {
    let node: Node;
    let relation: Relation;
    switch(this.nodeType) {
      case NodeType.ActionNode: {
        node = new ActionNode(id, [], []);
        relation = new Relation(id)
        break;
      }
      case NodeType.ClassifierNode: {
        node = new ClassifierNode(id, []);
        relation = new Relation(id)
        break;
      }
      case NodeType.ExtractNode: {
        node = new ExtractNode(id, new ExtractProps, [],);
        relation = new Relation(id)
        break;
      }
      case NodeType.ValidateNode: {
        node = new ValidateNode(id, new ValidateProps);
        relation = new Relation(id)
        break;
      }
      case NodeType.SpecifierNode: {
        node = new SpecifierNode(id, [], []);
        relation = new Relation(id)
        break;
      }
      case NodeType.EndNode: {
        node = new EndNode(id, []);
        relation = new Relation(id)
        break;
      }
    }
    this._modelService.model.push(node);
    this._modelService.model.forEach((node) => {
      if (node.id === this.parentNode) {
        node.edgeList.push(relation);
      }
    });
    console.log(this._modelService.model);
    this._eventService.send('addNode', {node: node, parent: this.parentNode});
    this.updateTree();
  }

  saveNodeData(parent: string, type: string) {
    this.parentNode = parent;
    this.nodeType = type;
  }
  deleteNodeFromModel(id: string) {
    let rNode = {};
    this._modelService.model.forEach((node: Node) => {
      if(node.id === id) {
        rNode = node;
      }
    });
    const index = this._modelService.model.indexOf(rNode as Node)
    if (index > -1) {
      this._modelService.model.splice(index, 1);
   }
   this._eventService.send('deleteNode', id);
  }
}