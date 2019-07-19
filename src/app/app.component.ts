import { Component, OnInit, AfterViewInit } from '@angular/core';
import {ModelService} from './services/model.service';
import { EventService } from './services/event.service';
import { NodeType } from './graph/nodes/nodes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent /*implements AfterViewInit*/ {
  title = 'voice-ivr-demo';

  constructor(private _modelService: ModelService,
              private _eventService: EventService) {
    this._modelService.init();
    _eventService.on("modelReceived", () => {
      this._eventService.send('showProps', {
        type: "options",
        node: "root"
      })
      this._eventService.send('selectNode', 'root');
    })
  }

  // ngAfterViewInit(): void {
  //   this._eventService.send('showProps', {
  //     type: "options",
  //     node: "root"
  //   })
  //   this._eventService.send('selectNode', 'root');
  //   //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
  //   //Add 'implements AfterViewInit' to the class.
  // }
}
