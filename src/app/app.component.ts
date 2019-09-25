import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ModelService } from './services/model.service';
import { EventService } from './services/event.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  {

  title = 'voice-ivr-demo';

  constructor(private modelService: ModelService) {
    this.modelService.init();
  }
}
