import { Component, OnInit } from '@angular/core';
import { ModelService } from '../../services/model.service';
import { NodeType } from 'src/app/graph/nodes/nodes';
import { TreeComponent } from '../tree.component';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-add-tree',
  templateUrl: './add-tree.component.html',
  styleUrls: ['./add-tree.component.scss']
})
export class AddTreeComponent implements OnInit {

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
}
