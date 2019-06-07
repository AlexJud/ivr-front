import { Component } from '@angular/core';
import {ModelService} from './services/model.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'voice-ivr-demo';

  constructor(private _modelService: ModelService) {
    this._modelService.init();
  }
}
