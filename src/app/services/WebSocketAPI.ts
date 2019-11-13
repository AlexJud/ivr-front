import {Injectable, OnInit} from '@angular/core';
import {EventService} from './event.service';
import * as Stomp from 'stompjs';
import {ModelService} from './model.service';
import {Events} from '../models/events';
import {Subscription} from 'rxjs';
import {MessageDTO} from '../models/messageDTO';

@Injectable()
export class WebSocketAPI {

  // webSocketEndPoint: string = 'wss://192.168.1.74:8080/wss';
  topic: string = '/topic/greetings';
  stompClient: any;
  logStyle = 'background: #222; color: #bada55';
  sub: Subscription;
  userId;

  constructor(private _eventService: EventService, private modelService: ModelService) {
  }

  setUserId(id: string) {
    this.userId = id;
  }

  connect() {
    console.log('Initialize WebSocket Connection');
    let url = '192.168.1.41'; //window.location.hostname //'192.168.1.74';
    this.stompClient = Stomp.client('wss://' + url + ':8080' + '/wss');

    this.stompClient.connect(
      {},
      frame => {
        this._eventService._events.emit('socketConnected');
        this.sub =
          this.stompClient.subscribe('/ivr/dialog', message => {
            this.onMessageReceived(message);
          });
      },
      error => {
        console.log('errorCallBack -> ' + error);
        if (error.indexOf('Lost connection') !== -1) {
          this._eventService._events.emit('socketLost');
          this.sub.unsubscribe();
        }
      });
  }

  disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
    console.log('Disconnected');
  }

  send(message) {
    this.stompClient.send('/app/echo', {}, JSON.stringify(message));
  }

  onMessageReceived(message) {

    console.log('Message Received from Server :: ' + message);
    console.log('Message Received from Server 2:: ' + this.userId);
    let body = JSON.parse(message.body);
    if (body.destination === this.userId) {
      if (body.type === 'HIGHLIGHT') {
        this._eventService._events.emit('highlightNode', body.message);
        this.modelService.graphViewModel.events.emit(Events.nodeactive, body.message);
      }
      this._eventService._events.emit('messageReceived', message);
    }
  }
}
