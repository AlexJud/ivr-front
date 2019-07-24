import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ModelService } from './services/model.service';
import { EventService } from './services/event.service';

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
    // _eventService._events.addListener("modelReceived", () => {
    //   this._eventService._events.emit('showProps', {
    //     type: "options",
    //     node: "root"
    //   });
    //   this._eventService._events.emit('selectNode', 'root');
    // })
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
