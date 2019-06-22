import { Component, OnInit, Input } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { ModelService } from 'src/app/services/model.service';
import { Node, NodeType } from 'src/app/graph/nodes/nodes';

@Component({
  selector: 'app-grid-settings-panel',
  templateUrl: './grid-settings-panel.component.html',
  styleUrls: ['./grid-settings-panel.component.scss']
})
export class GridSettingsPanelComponent implements OnInit {
  @Input() currentTable: any;

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
    this._eventService.on('showProps', (data) => {
      this.showButtons(data.node);
    })
  }

  addRow() {
    let item = this.currentTable.data[0];
    for(let key in item) {
      item[key] = '';
    }
    this.currentTable.data.push(item);
    this.currentTable._updateChangeSubscription();
  }
  private showButtons(nodeId: string) {
    let currentNode: Node;
    this._modelService.model.forEach((node) => {
      if(node.id === nodeId) {
        currentNode = node;
      }
    });
    switch (currentNode.constructor.name) {
      case NodeType.SpecifierNode: {
        this.showAdd = true;
        this.showDelete = true;
        this.showSave = true;
      }
    }
  }
}
