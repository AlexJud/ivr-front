import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
  @Output() addEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();
  nodes: string[] = [];
  types: string[] = [];
  model: any;

  constructor(private _modelService: ModelService,
              // private _treeComp: TreeComponent,
              private _eventService: EventService) {
      this.model = _modelService.viewModel;
      this.updateModel();
  }

  ngOnInit() {
    Object.keys(NodeType).map((element) => {
      this.types.push(NodeType[element]);
    });

    this._eventService._events.addListener('addNode', () => {
      this.updateModel();
    })

    this._eventService._events.addListener('nodeChanged', () => {
      this.updateModel();
    })

    this._eventService._events.addListener('deleteNode', () => {
      this.updateModel();
    })
  }

  private updateModel() {
    this.nodes = [...this.model.keys()]
  }

  add(parent: string, type: NodeType) {
    this.addEvent.emit({parent, type});
    // this._treeComp.addNode(parent, type);
  }

  delete() {
    this.deleteEvent.emit()
    // this._treeComp.deleteNode();
  }
  save() {
    this._modelService.saveToJson();
  // this._modelService.convertModel()
  }
  load() {
    this._modelService.requestModel()
  }
}
