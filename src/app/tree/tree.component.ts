import {FlatTreeControl, NestedTreeControl} from '@angular/cdk/tree';
import {Component, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener, MatTreeNestedDataSource} from '@angular/material/tree';
import {EventService} from '../services/event.service';
import { ModelService } from '../services/model.service';
import { BehaviorSubject } from 'rxjs';
import { ViewNode } from '../view-model-nodes/view.model-node';
import { Strings } from '../graph/nodeProps/optionStrings';



@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {
  addNodePressed: boolean = false;
  activeNode: ViewNode;
  // flatNodeMap = new Map<FlatNode, ViewNode>();
  // nestedNodeMap = new Map<ViewNode, FlatNode>();
  // selectedParent: FlatNode | null = null;
  newItemName: ViewNode;
  itemNodeMap = new Map<string, ViewNode>();
  checkedModel = false
  // selectedNode: FlatNode;
  parentNode: string;
  nodeType: string;
  
  // private transformer = (node: ViewModel, level: number) => {
  //   const flatNode = new FlatNode;
  //   flatNode.expandable = level == 0;
  //   flatNode.id = node.id;
  //   flatNode.level= level;
  //   this.flatNodeMap.set(flatNode, node);
  //   this.nestedNodeMap.set(node, flatNode);
  //   this.itemNodeMap.set(node.id, node);
  //   return flatNode
  // }

  // treeControl = new FlatTreeControl<FlatNode>(node => node.level, node => node.expandable);
  // treeFlattener = new MatTreeFlattener(this.transformer, node => node.level, node => node.expandable, node => node.childrenTree);
  // dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  treeControl = new NestedTreeControl<ViewNode>(node => node.childrenTree);
  dataSource = new MatTreeNestedDataSource<ViewNode>();

  constructor(private _eventService: EventService,
              private _modelService: ModelService) {
    // this.dataSource._data.subscribe(data => {
    //   this.dataSource.data = data
    // })
    this.dataSource.data = [...this._modelService.viewModel.values()] 
    console.log(this.treeControl);
    console.log(this.dataSource);
  }

  ngOnInit() {
    // this._eventService._events.addListener('selectNode', (id: string) => {
    //   let itemNode = this.itemNodeMap.get(id)
    //   let flatNode = this.nestedNodeMap.get(itemNode)
    //   this.nestedNodeMap.forEach((v,k) => {
    //     v.checked = false;
    //     this.treeControl.collapse(v)
    //   })
    //   this.treeControl.expand(flatNode)
    //   flatNode.checked = true
    //   for(let child of itemNode.children) {
    //     if(child.id === 'Параметры') {
    //       flatNode = this.nestedNodeMap.get(child)
    //       break
    //     } else {
    //       flatNode = this.nestedNodeMap.get(child)
    //     }
    //   }

    //   this.onTreeClick(flatNode)
    // });
  }

  // isLevelMoreThenOne = (_: number, _nodeData: FlatNode) =>  {
  //   return _nodeData.level === 1;
  // }
  hasChild = (_: number, node: ViewNode) => !!node.childrenTree && node.childrenTree.length > 0;
  onTreeClick(node: ViewNode) {
    this.activeNode = node;
    const type = node.id === Strings.CHILDREN ? 'children' : 'options'
    this._eventService._events.emit('showProps', {
      type: type,
      node: node.parent
    })
  }

  // checked(node: ViewNode) {
  //   if(!node.checked) {
  //     this._eventService._events.emit('selectNode', node.id);
  //     this.selectedNode = node;
  //   }
  // }

  // createItemNode(id: string): NestedNode {
  //   return new NestedNode(id, [/*new ItemNode('Параметры', [], id)*/])
  // }


  addNode(event: any) {
    console.log(event);
    this.parentNode = event.parent;
    this.nodeType = event.type;
    this.addNodePressed = true;  
  }

  saveNode(id: string) {
    if(id !== undefined && id !== '') {
      this.addNodePressed = false;
      this._modelService.addNewViewNode(id, this.nodeType, this.parentNode)
    } else {
      this.addNodePressed = false;
    }
    this.dataSource._data.next([...this._modelService.viewModel.values()]);
    console.log(this._modelService.viewModel);
    console.log(this.dataSource);
  }

  // deleteNode() {
  //   const item = this.flatNodeMap.get(this.selectedNode);
  //   this._database.removeItem(item);
  //   this._database.deleteNodeFromModel(item.id);
  // }
}
