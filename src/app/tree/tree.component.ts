import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {ActionNode, Node, NodeType, ClassifierNode, ExtractNode, ValidateNode, SpecifierNode, EndNode} from '../graph/nodes/nodes';
import {ModelService} from '../services/model.service';
import {EventService} from '../services/event.service';
import { Relation } from '../graph/nodes/relation';
import { ValidateProps } from '../graph/nodeProps/validateProps';
import { ItemNode, FlatNode, BuildTreeService } from '../services/build.tree.service';
import { log } from 'util';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {
  addNodePressed: boolean = false;
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

  selectedNode: FlatNode;
  private transformer = (node: ItemNode, level: number) => {
    const flatNode = new FlatNode;
    flatNode.expandable = !!node.children && node.children.length > 0;
    flatNode.id = node.id;
    flatNode.level= level;
    this.flatNodeMap.set(flatNode, node);
    this.flatNodeId.set(node.id, flatNode);
    return flatNode
  }
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level, node => node.expandable);
  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level, node => node.expandable, node => node.children);
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private _database: BuildTreeService,
              private _modelService: ModelService,
              private _eventService: EventService) {
    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  ngOnInit() {
    this._eventService.on('selectNode', (id: string) => {
      this.treeControl.expand(this.flatNodeId.get(id))
      let element: HTMLElement = document.getElementById('checkbox-' + id);
      console.log(element);
      element.click();
      // this.checked(this.flatNodeId.get(id));
      // let itemNode = this.flatNodeMap.get(this.flatNodeId.get(id)).children[0];
      // this.activeNode = this.flatNodeId.get(itemNode.id);
      // console.log(this.activeNode)
    });
  }

  // getLevel = (node: FlatNode) => node.level;
  // isExpandable = (node: FlatNode) => node.expandable;
  // getChildren = (node: ItemNode): ItemNode[] => node.children;
  // hasNoContent = (_: number, _nodeData: FlatNode) => _nodeData.id === '';
  isLevelMoreThenOne = (_: number, _nodeData: FlatNode) =>  {
    return _nodeData.level === 1;
  }
  onTreeClick(node: FlatNode) {
    const type = node.id === 'Дочерние узлы' ? 'children' : 'options'
    const nodeId = this.flatNodeMap.get(node).parent;
    this._eventService.send('showProps', {
      type: type,
      node: nodeId
    })
    this.activeNode = node;
  }
  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  
  // transformer = (node: ItemNode, level: number) => {
  //   const existingNode = this.nestedNodeMap.get(node);
  //   const flatNode = existingNode && existingNode.id === node.id
  //     ? existingNode
  //     : new FlatNode();
  //   flatNode.id = node.id;
  //   flatNode.level = level;
  //   flatNode.expandable = !!node.children;
  //   this.flatNodeMap.set(flatNode, node);
  //   this.nestedNodeMap.set(node, flatNode);
  //   this.flatNodeId.set(node.id, flatNode);
  //   return flatNode;
  // }
  checked(node: FlatNode) {
    console.log(node)
    this.selectedNode = node;
  }

  createItemNode(id: string): ItemNode {
    return new ItemNode(id, [/*new ItemNode('Параметры', [], id)*/])
  }

  /* 
  Show input to user for type new Node name
  Save parent and Node type to global variables
  */
  addNode(event: any) {
    console.log(event);
    this._database.saveNodeData(event.parent, event.type)
    this.addNodePressed = true;
  }

  /** Save the node to database */
  saveNode(id: string) {
    if(id !== undefined && id !== '') {
      this._database.insertItem(this.createItemNode(id));
      this._database.addNodeToModel(id);
      this.addNodePressed = false;
    } else {
      this.addNodePressed = false;
    }
  }

  deleteNode() {
    const item = this.flatNodeMap.get(this.selectedNode);
    this._database.removeItem(item);
    this._database.deleteNodeFromModel(item.id);
    // this.deleteChild(item);
  }
}
