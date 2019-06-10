import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, Injectable} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {BehaviorSubject} from 'rxjs';
import {ActionNode, Node, NodeType} from '../nodes/nodes';
import {ModelService} from '../services/model.service';
import {EventService} from '../services/event.service';
import {element} from 'protractor';
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';
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
    // const data = this.buildFileTree(TREE_DATA, 0);
    console.log(data);
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
  // /** Add an idto to-do list */
  // insertItem(parent: TodoItemNode, name: string) {
  //   if (parent.children) {
  //     parent.children.push({item: name} as TodoItemNode);
  //     this.dataChange.next(this.data);
  //   }
  // }
  //
  insertRoot(node: ItemNode) {
    this.data.push(node);
    this.dataChange.next(this.data);
    console.log('After insert')
    console.log(this.data)
  }

  updateItem(node: ItemNode, name: string) {
    node.id = name;
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
export class TreeComponent {
  activeNode: any;
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<FlatNode, ItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<ItemNode, FlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: FlatNode | null = null;

  /** The new item's name */
  newItemName = '';
  parentNode: string;
  nodeType: NodeType;

  treeControl: FlatTreeControl<FlatNode>;
  treeFlattener: MatTreeFlattener<ItemNode, FlatNode>;
  dataSource: MatTreeFlatDataSource<ItemNode, FlatNode>;

  constructor(private _database: ChecklistDatabase,
              private _modelService: ModelService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<FlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
    this._modelService.init();
  }

  getLevel = (node: FlatNode) => node.level;
  isExpandable = (node: FlatNode) => node.expandable;
  getChildren = (node: ItemNode): ItemNode[] => node.children;
  hasChild = (_: number, _nodeData: FlatNode) => _nodeData.expandable;
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
    return flatNode;
  }
  checked() {
    console.log('Ты выбрал это');
  }

  /** Select the category so we can insert the new item. */
  // addNewItem(node: FlatNode) {
  //   const parentNode = this.flatNodeMap.get(node);
  //   this._database.insertItem(parentNode!, '');
  //   this.treeControl.expand(node);
  // }
  //
  addNode(parent: string, type: NodeType) {
    this.parentNode = parent;
    this.nodeType = type;
    const emptyItem = new ItemNode('', [new ItemNode('Дочерние узлы', []), new ItemNode('Параметры', [])]);
    this._database.insertRoot(emptyItem);
  }

  /** Save the node to database */
  saveNode(node: FlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this._database.updateItem(nestedNode!, itemValue);
    this.addNodetoModel(itemValue, [], [])
  }

  addNodetoModel(id: string, props: [], children: [], ) {
    switch(this.nodeType) {
      case NodeType.ActionNode: {
        let node = new ActionNode(id, props, children);
        this._modelService.model.push(node);
        this._modelService.model.forEach((node)=> {
          if (node.id === this.parentNode) {
            node.children.push(id);
          }
        });
      }
    }
    console.log(this._modelService.model);
  }
  test() {
    // this._eventService.send('message.test', {testData: 'My first message to somebody...'});
  }
}
