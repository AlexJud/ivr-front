import { Component, OnInit } from '@angular/core';
import { ModelService } from '../../services/model.service';
import { NodeType } from 'src/app/graph/nodes/nodes';
import { TreeComponent } from '../tree.component';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-tree-panel',
  templateUrl: './tree-panel.component.html',
  styleUrls: ['./tree-panel.component.scss']
})
export class TreePanelComponent implements OnInit {

  nodes: string[] = [];
  types: string[] = [];
  model: any;

  constructor(private _modelService: ModelService,
              private _treeComp: TreeComponent,
              private _eventService: EventService) { 
    this.model = _modelService.model;
  }

  ngOnInit() {
    Object.keys(NodeType).map((element) => {
      this.types.push(NodeType[element]);
    });
    this.updateModel();
    this._eventService.on('addNode', () => {
      this.updateModel();
    })
  }

  private updateModel() {
    this.nodes = [];
    Object.keys(this.model).map((element, index, arr) => {
      this.nodes.push(this.model[element].id);
    });
  }

  add(parent: string, type: NodeType) {
    this._treeComp.addNode(parent, type);
  }
  delete() {
    this._treeComp.deleteNode();
  }
  save() {
    this._modelService.saveToJson();
  }
}
