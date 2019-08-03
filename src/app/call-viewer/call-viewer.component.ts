import { Component, OnInit } from '@angular/core';
import { WebSocketAPI } from '../services/WebSocketAPI';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-call-viewer',
  templateUrl: './call-viewer.component.html',
  styleUrls: ['./call-viewer.component.scss']
})

export class CallViewerComponent implements OnInit {
  serverMessages: string[] = []
  userMessages: string[] = []

  constructor(private _webSocket: WebSocketAPI,
              private _eventService: EventService) { }

  ngOnInit() {
    this._eventService._events.addListener('serverMessage', (message) => {
      this.serverMessages.push(JSON.parse(message.body).message)
      console.log('====================MESAAAGE!!!!!!!!!!=====================', message);
    })
  }

}
