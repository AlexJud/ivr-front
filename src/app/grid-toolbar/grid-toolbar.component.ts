import {Component, OnInit} from '@angular/core';
import {EventService} from '../services/event.service';

@Component({
  selector: 'app-grid-toolbar',
  templateUrl: './grid-toolbar.component.html',
  styleUrls: ['./grid-toolbar.component.scss']
})
export class GridToolbarComponent implements OnInit {

  constructor(private _eventService: EventService) {
  }

  showData(event) {
    console.log(`this EVENT ${event}`);
  }

  ngOnInit() {
    this._eventService._events.addListener('message.test', (data) => {
      alert('I\'v got mesage ' + JSON.stringify(data));
    });
  }
}
