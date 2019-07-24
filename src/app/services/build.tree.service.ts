import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModelService } from './model.service';
import { NodeType, ActionNode, Node, ClassifierNode, ExtractNode, ValidateNode, SpecifierNode, EndNode } from '../graph/nodes/nodes';
import { Relation } from '../graph/nodes/relation';
import { ExtractProps } from '../graph/nodeProps/extractProps';
import { ValidateProps } from '../graph/nodeProps/validateProps';
import { EventService } from './event.service';
import { ActionProps } from '../graph/nodeProps/actionProps';

export class ViewNode {
  id: string;
  children?: ViewNode[];
  parent?: string;
  constructor(id: string, children?: ViewNode[], parent?: string) {
    this.id = id;
    this.children = children;
    this.parent = parent;
  }
}

export class FlatNode {
  id: string;
  level: number;
  expandable: boolean;
  checked: boolean;
}

@Injectable()
export class BuildTreeService {
  parentNode: string;
  nodeType: string;
  parentMap: Map<string, string> = new Map();
  dataChange = new BehaviorSubject<ViewNode[]>([]);

  get data(): ViewNode[] { return this.dataChange.value; }

  constructor(private _modelService: ModelService,
              private _eventService: EventService) {
    _eventService._events.addListener("modelReceived", () => {
      this.updateTree();
    });
    _eventService._events.addListener("addNode", () => {
      this.updateTree();
    });

    _eventService._events.addListener("nodeChanged", () => {
      this.updateTree();
    });
  }

  updateTree() {
    const data = this.buildTree();
    this.dataChange.next(data);
  }

  private buildTree(): ViewNode[] {
    let tree: ViewNode[] = [];
    this._modelService.model.map((node) => {
      if (node.props && node.edgeList) {
        tree.push(new ViewNode(node.id, [new ViewNode('Параметры', [], node.id), new ViewNode('Дочерние узлы', [], node.id)]));
      } else if (node.props && !node.edgeList) {
        tree.push(new ViewNode(node.id, [new ViewNode('Параметры', [], node.id)]));
      } else if (!node.props && node.edgeList) {
        tree.push(new ViewNode(node.id, [new ViewNode('Дочерние узлы', [], node.id)]));
      }
      if (node.edgeList) {
        node.edgeList.forEach(child => {
          this.parentMap.set(child.id, node.id)
        })
      }
    });
    console.log('TREE', tree)
    return tree //as ItemNode[];
  }

  insertItem(node: ViewNode) {
    this.data.push(node);
    this.dataChange.next(this.data);
  }

  removeItem(node: ViewNode) {
    const index = this.data.indexOf(node);

    if (index > -1) {
      this.data.splice(index, 1);
    }
    this.dataChange.next(this.data);
  }
  
  addNodeToModel(id: string) {
    const node = this._modelService.addNodeToViewModel(id, this.nodeType, this.parentNode);
    this.parentMap.set(node.id, this.parentNode);
    console.log('Parent MAP: ', this.parentMap);
    this._eventService._events.emit('addNode', { node: node, parent: this.parentNode });
    this.updateTree();
  }

  saveNodeData(parent: string, type: string) {
    this.parentNode = parent;
    this.nodeType = type;
  }
  deleteNodeFromModel(id: string) {
    let rNode = {};
    this._modelService.model.forEach((node: Node) => {
      if (node.id === id) {
        rNode = node;
      }
    });
    const index = this._modelService.model.indexOf(rNode as Node)
    if (index > -1) {
      this._modelService.model.splice(index, 1);
    }
    this.deleteChild(id);
    this.updateTree();
    console.log(this._modelService.model);
    this._eventService._events.emit('deleteNode', id);
  }
  deleteChild(id: string) {
    const nodeId = this.parentMap.get(id);
    const node: Node = this._modelService.getNode(nodeId);
    if (node) {
      for (let i = 0; i < node.edgeList.length; i++) {
        if (node.edgeList[i].id === id) {
          node.edgeList.splice(i, 1);
        }
      }
    }
  }
}
