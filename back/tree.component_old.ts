import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {ActionNode, Node, NodeType, ClassifierNode, ExtractNode, ValidateNode, SpecifierNode, EndNode} from '../graph/nodes/nodes';
import {ModelService} from '../services/model.service';
import {EventService} from '../services/event.service';
import { Relation } from '../graph/nodes/relation';
import { ValidateProps } from '../graph/nodeProps/validateProps';
import { ItemNode, FlatNode, BuildTreeService } from '../services/build.tree.service';

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

  constructor(private _database: BuildTreeService,
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
    this._eventService._events.addListener('selectNode', (id: string) => {
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
    const type = node.id === 'Дочерние узлы' ? 'children' : 'options'
    const nodeId = this.flatNodeMap.get(node).parent;
    this._eventService._events.emit('showProps', {
      type: type,
      node: nodeId
    })
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
    this._database.insertItem(this.newItemName);
  }

  /** Save the node to database */
  saveNode(node: FlatNode, itemValue: string) {
    // const nestedNode = this.flatNodeMap.get(node);
    // this._database.updateItem(nestedNode!, itemValue);
    this.newItemName.children.map((child) => child.parent = itemValue)
    // this._database.updateItem(this.newItemName, itemValue);
    this.addNodeToModel(itemValue, [], [])
  }

  deleteNode() {
    const item = this.flatNodeMap.get(this.selectedNode);
    this._database.removeItem(item);
    this.deleteNodeFromModel(item.id);
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
   this._eventService._evets.emit('deleteNode', id);
  }

  addNodeToModel(id: string, props: any, children: [], ) {
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
        relation = new Relation(id)
        break;
      }
      case NodeType.ExtractNode: {
        node = new ExtractNode(id, props ,children,);
        relation = new Relation(id)
        break;
      }
      case NodeType.ValidateNode: {
        node = new ValidateNode(id, new ValidateProps);
        relation = new Relation(id)
        break;
      }
      case NodeType.SpecifierNode: {
        node = new SpecifierNode(id, props, children);
        relation = new Relation(id)
        break;
      }
      case NodeType.EndNode: {
        node = new EndNode(id, props);
      }
    }
    this._modelService.model.push(node);
    this._modelService.model.forEach((node) => {
      if (node.id === this.parentNode) {
        node.edgeList.push(relation);
      }
    });
    this._eventService._events.emit('addNode', {node: node, parent: this.parentNode});
  }
}
