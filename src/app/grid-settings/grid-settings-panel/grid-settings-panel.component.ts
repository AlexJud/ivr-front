import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { ModelService, TableView } from 'src/app/services/model.service';
import { Node, NodeType } from 'src/app/graph/nodes/nodes';
import { SpecifierProps } from 'src/app/graph/nodeProps/specifierProps';
import { ViewNode } from 'src/app/view-model-nodes/viewNode';

@Component({
  selector: 'app-grid-settings-panel',
  templateUrl: './grid-settings-panel.component.html',
  styleUrls: ['./grid-settings-panel.component.scss']
})
export class GridSettingsPanelComponent implements OnInit {
  @Input() currentTable: any;
  @Output() deleteEvent = new EventEmitter();
  showAdd: boolean;
  showDelete: boolean;
  showSave: boolean;
  constructor(private _eventService: EventService,
              private _modelService: ModelService) {
    this.showAdd = false;
    this.showDelete = false;
    this.showSave = false;
  }

  ngOnInit() {
    this._eventService._events.addListener('showProps', (data) => {
      this.showButtons(data.node);
    })
  }

  addRow() {
    // let tableView = this._modelService.createSpecifierViewNodeOptions()
    // this.currentTable.data.push(tableView.optionsDataSource[0]);
    this.currentTable._updateChangeSubscription();
    console.log(this._modelService.viewModel);
  }
  deleteRow() {
    this.deleteEvent.emit()
  }

  private showButtons(nodeId: string) {
    let currentNode: ViewNode;
    this._modelService.viewModel.forEach((node) => {
      if(node.id === nodeId) {
        currentNode = node;
      }
    });
    switch (currentNode.type) {
      case NodeType.SpecifierNode: {
        this.showAdd = true;
        this.showDelete = true;
        this.showSave = true;
        break
      }
      default: {
        this.showAdd = false;
        this.showDelete = false;
        this.showSave = false;
      }
    }
  }
}
