import { Component, OnInit } from '@angular/core';
import {EventService} from '../services/event.service';

@Component({
  selector: 'app-grid-toolbar',
  templateUrl: './grid-toolbar.component.html',
  styleUrls: ['./grid-toolbar.component.scss']
})
export class GridToolbarComponent implements OnInit {

  constructor(private _eventService: EventService) { }

  ngOnInit() {
    this._eventService.on('message.test', (data) => {
      alert('I\'v got mesage ' + JSON.stringify(data));
    });
  }
}
