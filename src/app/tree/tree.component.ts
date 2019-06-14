import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, Injectable, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {BehaviorSubject} from 'rxjs';
import {ActionNode, Node, NodeType, ClassifierNode, ExtractNode, ValidateNode} from '../graph/nodes/nodes';
import {ModelService} from '../services/model.service';
import {EventService} from '../services/event.service';
import {element} from 'protractor';
import { NULL_EXPR, ClassField, ThrowStmt } from '@angular/compiler/src/output/output_ast';
import { networkInterfaces } from 'os';
import { Relation } from '../graph/nodes/relation';
/** Flat to-do idnode with expandable and level information */
export class FlatNode {
  id: string;
  level: number;
  expandable: boolean;
}

export class ItemNode {
  id: string;
  children: ItemNode[];

  constructor(id: string, children: ItemNode[]) {
    this.id = id;
    this.children = children;
  }
}

@Injectable({
    providedIn: 'root'
})
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<ItemNode[]>([]);

  get data(): ItemNode[] { return this.dataChange.value; }

  constructor(private _modelService: ModelService) {
    this._modelService.init();
    this.initialize();
  }

  initialize() {
    const data = this.buildTree();
    this.dataChange.next(data);
  }

  private buildTree(): ItemNode[] {
    let tree = [];
    this._modelService.model.map((node) => {
      if (node.props) {
        tree.push(new ItemNode(node.id, [new ItemNode('Дочерние узлы', []), new ItemNode('Параметры', [])]));
      } else {
        tree.push(new ItemNode(node.id, [new ItemNode('Дочерние узлы', [])]));
        }
    });
    return tree as ItemNode[];
  }

  insertRoot(node: ItemNode) {
    this.data.push(node);
    this.dataChange.next(this.data);
  }

  updateItem(node: ItemNode, name: string) {
    node.id = name;
    this.dataChange.next(this.data);
  }

  removeItem(node: ItemNode) {
    const index = this.data.indexOf(node);
 
    if (index > -1) {
       this.data.splice(index, 1);
    }
    this.dataChange.next(this.data);
  }
}

/**
 * @title Tree with checkboxes
 */
@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit{
  activeNode: any;
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<FlatNode, ItemNode>();
  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<ItemNode, FlatNode>();
  /** A selected parent node to be inserted */
  selectedParent: FlatNode | null = null;
  /** The new item's name */
  newItemName: ItemNode;
  /** Map from flat node to node ID */
  flatNodeId = new Map<string, FlatNode>();
  parentNode: string;
  nodeType: NodeType;
  selectedNode: FlatNode;

  treeControl: FlatTreeControl<FlatNode>;
  treeFlattener: MatTreeFlattener<ItemNode, FlatNode>;
  dataSource: MatTreeFlatDataSource<ItemNode, FlatNode>;

  constructor(private _database: ChecklistDatabase,
              private _modelService: ModelService,
              private _eventService: EventService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<FlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
    this._modelService.init();
  }

  ngOnInit() {
    this._eventService.on('selectNode', (id: string) => {
      console.log('Event is come');
      console.log(id);
      console.log(this.flatNodeId.get(id));
      this.treeControl.expand(this.flatNodeId.get(id))
    }); 
  }

  getLevel = (node: FlatNode) => node.level;
  isExpandable = (node: FlatNode) => node.expandable;
  getChildren = (node: ItemNode): ItemNode[] => node.children;
  hasNoContent = (_: number, _nodeData: FlatNode) => _nodeData.id === '';
  isLevelMoreThenOne = (_: number, _nodeData: FlatNode) =>  {
    return this.getLevel(_nodeData) === 1;
  }
  onTreeClick(node: FlatNode) {
    this.activeNode = node;
  }
  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: ItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.id === node.id
      ? existingNode
      : new FlatNode();
    flatNode.id = node.id;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    this.flatNodeId.set(node.id, flatNode);
    return flatNode;
  }
  checked(node: FlatNode) {
    this.selectedNode = node;
  }

  addNode(parent: string, type: NodeType) {
    this.parentNode = parent;
    this.nodeType = type;
    this.newItemName = new ItemNode('', [new ItemNode('Дочерние узлы', []), new ItemNode('Параметры', [])]);
    this._database.insertRoot(this.newItemName);
  }

  /** Save the node to database */
  saveNode(node: FlatNode, itemValue: string) {
    // const nestedNode = this.flatNodeMap.get(node);
    // this._database.updateItem(nestedNode!, itemValue);
    this._database.updateItem(this.newItemName, itemValue);
    this.addNodeToModel(itemValue, [], [])
  }

  deleteNode() {
    const item = this.flatNodeMap.get(this.selectedNode);
    this._database.removeItem(item);
  }

  addNodeToModel(id: string, props: [], children: [], ) {
    let node: Node;
    let relation: Relation;
    switch(this.nodeType) {
      case NodeType.ActionNode: {
        node = new ActionNode(id, props, children);
        relation = new Relation(id)
        break;
      }
      case NodeType.ClassifierNode: {
        node = new ClassifierNode(id, children);
        break;
      }
      case NodeType.ExtractNode: {
        node = new ExtractNode(id, props ,children,);
        break;
      }
      case NodeType.ValidateNode: {
        node = new ValidateNode(id, children);
        break;
      }
    }
    this._modelService.model.push(node);
    this._modelService.model.forEach((node) => {
      if (node.id === this.parentNode) {
        node.children.push(relation);
      }
    });
    this._eventService.send('addNode', {node: node, parent: this.parentNode});
  }
}
