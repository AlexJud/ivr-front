import { Component, OnInit } from '@angular/core';
declare var SIPml: any;

@Component({
  selector: 'app-call-button',
  templateUrl: './call-button.component.html',
  styleUrls: ['./call-button.component.scss']
})
export class CallButtonComponent implements OnInit {
  oConfigCall;
  oSipStack;
  sipStack;
  oSipSessionCall;
  callSession;
  registerSession;
  create;

  constructor() {
  }

  ngOnInit() {
    //Initialize the engine
    SIPml.init(/*this.readyCallback, this.errorCallback*/);
    
    // this.oConfigCall = {
    //   audio_remote: document.getElementById('audio_remote'),
    //   bandwidth: { audio: undefined, video: undefined },
    //   ice_servers: [],
    //   sip_caps: [
    //     { name: '+g.oma.sip-im' },
    //     { name: 'language', value: '\"en,fr\"' }
    //   ]
    // };
  }

  createSipStack() {
    const empty_ice = [];
    this.sipStack = new SIPml.Stack({
      realm: '192.168.1.87', // mandatory: domain name
      impi: '1060', // mandatory: authorization name (IMS Private Identity)
      impu: 'sip:1060@192.168.1.87', // mandatory: valid SIP Uri (IMS Public Identity)
      password: 'password', // optional
      websocket_proxy_url: 'wss://192.168.1.87:8089/ws', // optional
      ice_servers: '[{ url: \'stun:stun.l.google.com:19302\'}]',
      // enable_rtcweb_breaker: false, // optional
      events_listener: { events: '*', listener: this.eventsListener }, // optional: '*' means all events
      sip_headers: [ // optional
        { name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.0.0.0' },
        { name: 'Organization', value: 'Doubango Telecom' }
      ]
    });
    this.sipStack.start();
  }

  // readyCallback() {
  //   this.create();
  //   let varName = 'KUSUKAAAAAA'
  // }

  // errorCallback(e: any) {
  //   console.error('Failed to initialize the engine: ' + e.message);
  // }

  eventsListener(e: any) {
    console.info('session event = ' + e.type);
    if(e.type == 'started'){
      this.registerSession = this.sipStack.newSession('register', {
        events_listener: { events: '*', listener: this.eventsListener } // optional: '*' means all events
      });
      this.registerSession.register();
      console.log('You are logged in!')
    }
    else if(e.type == 'connected' && e.session == this.registerSession) {
        // this.makeCall();
        console.log('You can call now!')
        // sendMessage();
        // publishPresence();
        // subscribePresence('johndoe'); // watch johndoe's presence status change
    }
  }

  login() {
    this.createSipStack();
  }

  makeCall = function(){
    this.callSession = this.sipStack.newSession('call-audio', {
        audio_remote: document.getElementById('audio_remote'),
        events_listener: { events: '*', listener: this.eventsListener } // optional: '*' means all events
    });
    this.callSession.call('1060');
  }

  // register() {
  //   this.oSipStack = new SIPml.Stack({
  //     realm: '192.168.1.87',
  //     impi: '1060',
  //     impu: 'sip:1060@192.168.1.87',
  //     password: 'password',
  //     websocket_proxy_url: 'wss://192.168.1.87:8089/ws',
  //     ice_servers: empty_ice,
  //     sip_headers: [
  //       { name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.2016.03.04' },
  //       { name: 'Organization', value: 'Doubango Telecom' }
  //     ]
  //   }
  // );
  // if (this.oSipStack.start() !== 0) {
  //   console.log('Stack not started');
  // }
  //   // const oSipSessionRegister = this.oSipStack.newSession('register', {
  //   //   expires: 200,
  //   //   // events_listener: { events: '*', listener: onSipEventSession },
  //   //   sip_caps: [
  //   //     { name: '+g.oma.sip-im', value: null },
  //   //     { name: '+audio', value: null },
  //   //     { name: 'language', value: '\"en,fr\"' }
  //   //   ]
  //   // });
  //   // oSipSessionRegister.register();
  // }
  // call = () => {
  //   this.oSipSessionCall  = this.oSipStack.newSession('call-audio', this.oConfigCall);
  //   console.log('ICE IS: ' + this.oSipStack.ice_servers);
  //   this.oSipSessionCall.call('1060');
  //   if (this.oSipSessionCall) {
  //     this.oSipSessionCall.accept(this.oConfigCall);
  //   }
  // }

  fastCall() {
    SIPml.init(
      function(e){
          var stack =  new SIPml.Stack({
            realm: '192.168.1.87',
            impi: '1060',
            impu: 'sip:1060@192.168.1.87',
            password: 'password',
            websocket_proxy_url: 'wss://192.168.1.87:8089/ws',
            ice_servers: [],
            events_listener: { events: 'started', listener: function(e){
                        var callSession = stack.newSession('call-audio', {
                                // video_local: document.getElementById('video-local'),
                                // video_remote: document.getElementById('video-remote'),
                                audio_remote: document.getElementById('audio_remote')
                            });
                        callSession.call('1060');
                    } 
            }
          });
          stack.start();
      }
);
  }

}
