import { Component, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ModelService } from '../services/model.service';
import { EventService } from '../services/event.service';
import { ViewNode } from '../view-model-nodes/viewNode';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-node-settings-panel',
  templateUrl: './node-settings-panel.component.html',
  styleUrls: ['./node-settings-panel.component.scss']
})
export class NodeSettingsPanelComponent implements OnInit {
  currentNode: ViewNode
  // asrType = this.currentNode['Слитное распознавание', 'Распознавание по грамматике']
  // step = 0;
  model;
  myControl = new FormControl()
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  fruits: any[] = ['Lemon', 'Lime', 'Apple'];

  panelOpenState = false;

  constructor(private _modelService: ModelService,
              private _eventService: EventService) { }

  ngOnInit() {
    this.setDataSource({node:'root'})
    this._eventService._events.addListener('showProps', (data) => {
      this.setDataSource(data)
    });
    this.model = this._modelService.model;
    
  }

  setDataSource(data: any) {
    this.currentNode = this._modelService.viewModel.get(data.node)
    console.log(this.currentNode)
  }

  // setStep(index: number) {
  //   this.step = index;
  // }

  // nextStep() {
  //   this.step++;
  // }

  // prevStep() {
  //   this.step--;
  // }


  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.fruits.push({ name: value.trim() });
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(fruit: any): void {
    console.log('TEST', this._modelService.model);
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
    
    
    console.log('UpDATe',this._modelService.model );
  }

}
