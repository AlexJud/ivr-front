import {Component, OnInit, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {WebSocketAPI} from '../../services/WebSocketAPI';
import {EventService} from '../../services/event.service';
import {style} from '@angular/animations';
import {MessageDTO} from '../../models/messageDTO';

interface MessageStyle {
  isServerMessage?: boolean
  isUserMessage?: boolean
  isSystemMessageInfo?: boolean
  isSysytemMessageError?: boolean
}

interface Message {
  message: string
  name?: string
  header?: string
  style: MessageStyle
}

@Component({
  selector: 'app-call-viewer',
  templateUrl: './call-viewer.component.html',
  styleUrls: ['./call-viewer.component.scss']
})

export class CallViewerComponent implements OnInit, AfterViewInit {
  messages: Message[] = [];
  logStyle = 'background: #222; color: #bada55';

  constructor(private _webSocket: WebSocketAPI,
              private _eventService: EventService) {
  }

  ngAfterViewInit() {
    let height = document.getElementsByClassName('mat-drawer-inner-container')[0].scrollHeight;
    document.getElementsByClassName('mat-drawer-inner-container')[0].scrollTo(0, height);
  }

  ngOnInit() {
    this._eventService._events.addListener('messageReceived', (message) => {
      console.log('%c Message recieved', this.logStyle);
      console.log(JSON.parse(message.body));
      this.messageHandler(JSON.parse(message.body));
    });
    // const date = new Date().toLocaleString("ru", {
    //   hour: 'numeric',
    //   minute: 'numeric',
    //   second: 'numeric'
    // })
    // const systemMessage = {
    //   type: 'SYSTEM',
    //   level: 'info',
    //   message: 'Звнок начался',
    //   date: date
    // }
    // const userMessage = {
    //   type: 'USER',
    //   message: 'Я хотет купить капусту!',
    //   name: 'Максим',
    //   date: date
    // }
    // const serverMessage = {
    //   type: 'SERVER',
    //   message: 'Привет, дружок! Чо хотет?',
    //   name: 'Сервер',
    //   date: date
    // }
    // this.messageHandler(systemMessage)
    // this.messageHandler(serverMessage)
    // this.messageHandler(userMessage)
  }

  messageHandler(message: MessageDTO) {
    let style: MessageStyle;
    switch (message.type) {
      case 'SYSTEM':
        style = {isSystemMessageInfo: true};
        this.messages.push({message: message.text, name: 'Системное сообщение', header: message.sentTime, style: style});
        break;

      case 'USER':
        style = {isUserMessage: true};
        this.messages.push({message: message.text, name: message.destination, header: message.sentTime, style: style});
        break;

      case 'SERVER': {
        style = {isServerMessage: true};
        this.messages.push({message: message.text, name: 'Сервер', header: message.sentTime, style: style});
        break;
      }
    }
    this.scrollDown();
  }

  scrollDown() {
    let height = document.getElementsByClassName('mat-drawer-inner-container')[0].scrollHeight;
    document.getElementsByClassName('mat-drawer-inner-container')[0].scrollTo(0, height);
  }

  clear() {
    this.messages = [];
  }
}
