import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { WebSocketAPI } from '../services/WebSocketAPI';
import { EventService } from '../services/event.service';
declare var SIPml: any;


@Component({
  selector: 'app-call-button',
  templateUrl: './call-button.component.html',
  styleUrls: ['./call-button.component.scss']
})
export class CallButtonComponent implements OnInit {
  sipStack;
  callSession;
  callStatus: boolean
  registerSession;
  bttns: any
  isProgress = false
  events: any
  logStyle = 'background: #222; color: #bada55'
  isAsteriskConnected: boolean
  isSocketConnected: boolean

  constructor(private _webSocket: WebSocketAPI,
    private _eventService: EventService) {
    this.bttns = {
      socketButton: {
        color: false,
        checked: false,
        value: 'Сервер: соединить',
      },
      asteriskButton: {
        color: false,
        checked: false,
        value: 'Asterisk: соединить',
      },
      callButton: {
        checked: false,
        color: false,
        disabled: true,
        value: 'Позвонить',
        icon: 'call'
      }
    }
  }

  ngOnInit() {
    //Initialize the engine
    // SIPml.init(/*this.readyCallback, this.errorCallback*/);
    this._eventService._events.addListener('socketConnected', () => {
      this.socketConnected()
    })
    this._eventService._events.addListener('socketLost', () => {
      this.toggleWebSocket()
    })
  }

  activateCallButton() {
    if (this.isAsteriskConnected && this.isSocketConnected) {
      this.bttns.callButton.disabled = false
    }
  }

  socketConnected() {
    this.isSocketConnected = true
    this.activateCallButton()
    this.bttns.socketButton.color = true;
    this.bttns.socketButton.value = 'Сервер: установлено';
    this.isProgress = false;
    this.bttns.socketButton.checked = true
  }

  asteriskConnected() {
    this.isAsteriskConnected = true
    this.isProgress = false
    this.bttns.asteriskButton.color = true
    this.bttns.asteriskButton.value = 'Asterisk: установлено'
    this.bttns.asteriskButton.checked = false
    this.activateCallButton()
  }

  toggleCall() {
    if(!this.bttns.callButton.checked) {
      this.makeCall()
      this.bttns.callButton.color = true
      this.bttns.callButton.value = 'Завершить'
      this.bttns.callButton.checked = true

    } else {
      this.callStatus = false;
      this.callSession.hangup()
      this.bttns.callButton.color = false
      this.bttns.callButton.value = 'Позвонить'
      this.bttns.callButton.checked = false
      this.bttns.callButton.call = 'call_end'
    }

  }

  toggleAsterisk() {
    if (!this.bttns.asteriskButton.checked) {
      this.isProgress = true
      this.initEngine()
    } else {
      this.logout()
      this.bttns.asteriskButton.color = ''
      this.bttns.asteriskButton.value = 'Asterisk: соединить'
      this.bttns.asteriskButton.checked = false
    }
  }

  toggleWebSocket() {
    if (!this.bttns.socketButton.checked) {
      this.isProgress = true
      this._webSocket.connect()
    } else {
      this._webSocket.disconnect()
      this.bttns.socketButton.color = ''
      this.bttns.socketButton.value = 'Сервер: соединить'
      this.bttns.socketButton.checked = false
    }
  }

  //Инициализируем движки, создаём колбэк функции
  initEngine() {
    const _this = this
    const readyCallback = function (e) {
      _this.createSipStack()
        console.log('%c SIPStack created!', _this.logStyle)
        _this.startSipStack()
        console.log('%c SIPStack Started!', _this.logStyle)
    };
    var errorCallback = function (e) {
        console.error('Failed to initialize the engine: ' + e.message);
    }
    SIPml.init(readyCallback, errorCallback);
  }

  //Функция старта SipStack. Соединяется с веб-сокетом, не делая никаких SIP-запросов
  startSipStack() {
    this.sipStack.start();
  }

  //Создаём SipStack, указываем кто слушает события
  createSipStack() {
    this.sipStack = new SIPml.Stack({
      realm: '192.168.1.87', // mandatory: domain name
      impi: '1060', // mandatory: authorization name (IMS Private Identity)
      impu: 'sip:1060@192.168.1.87', // mandatory: valid SIP Uri (IMS Public Identity)
      password: 'password', // optional
      websocket_proxy_url: 'wss://192.168.1.87:8089/ws', // optional
      // ice_servers: '[{ url: \'stun:stun.l.google.com:19302\'}]',
      ice_servers: '[]',
      // enable_rtcweb_breaker: false, // optional
      events_listener: { events: '*', listener: (e) => {
        if (e.type == 'started') {
          this.login()
        } else if (e.type == 'i_new_message') { // incoming new SIP MESSAGE (SMS-like)
          // acceptMessage(e);
        } else if (e.type == 'i_new_call') { // incoming audio/video call
          this.acceptCall(e);
        }
      }}, // optional: '*' means all events
      sip_headers: [ // optional
        { name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.0.0.0' },
        { name: 'Organization', value: 'Doubango Telecom' }
      ]
    });
  }

  acceptCall(e) {
    e.newSession.accept({
      audio_remote: document.getElementById('audio_remote')
    }); // e.newSession.reject() to reject the call
  }

  login() {
    const _this = this
    this.registerSession = this.sipStack.newSession('register', {
      events_listener: {
        events: '*',
        listener: (e) => {
          console.info('session event = ' + e.type);
          if (e.type == 'connected' && e.session == this.registerSession) {
            console.log('%c We are successfuly logged in!', this.logStyle)
            _this.asteriskConnected()
            // makeCall();
            // sendMessage();
            // publishPresence();
            // subscribePresence('johndoe'); // watch johndoe's presence status change
          }
        }
      } // optional: '*' means all events
    });
    this.registerSession.register();
  }

  logout() {
    this.registerSession.unregister()
  }

  makeCall() {
    this.callSession = this.sipStack.newSession('call-audio', {
      audio_remote: document.getElementById('audio_remote'),
      events_listener: {
        events: '*',
        listener: (e) => {
          console.log('%c Event recived ' + e.type, this.logStyle);
          if(e.type === 'terminated') {
            if(this.callStatus) {
              console.log(this.callStatus);
              this.toggleCall();
            }
          }
        }
      } // optional: '*' means all events
    });
    this.callSession.call('1060');
    this.callStatus = true;
  }
}
