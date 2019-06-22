import { Component, OnInit } from '@angular/core';
declare var SIPml: any;

@Component({
  selector: 'app-call-button',
  templateUrl: './call-button.component.html',
  styleUrls: ['./call-button.component.scss']
})
export class CallButtonComponent implements OnInit {

  constructor() { }
  oConfigCall;
  oSipStack;
  oSipSessionCall;
  ngOnInit() {
    this.oConfigCall = {
      audio_remote: document.getElementById('audio_remote'),
      bandwidth: { audio: undefined, video: undefined },
      ice_servers: [],
      sip_caps: [
        { name: '+g.oma.sip-im' },
        { name: 'language', value: '\"en,fr\"' }
      ]
    };

  }
  register() {
    this.oSipStack = new SIPml.Stack({
      realm: '192.168.1.87',
      impi: '1060',
      impu: 'sip:1060@192.168.1.87',
      password: 'password',
      websocket_proxy_url: 'wss://192.168.1.87:8089/ws',
      ice_servers: [],
      sip_headers: [
        { name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.2016.03.04' },
        { name: 'Organization', value: 'Doubango Telecom' }
      ]
    }
  );
  if (this.oSipStack.start() !== 0) {
    console.log('Stack not started');
  }
    // const oSipSessionRegister = this.oSipStack.newSession('register', {
    //   expires: 200,
    //   // events_listener: { events: '*', listener: onSipEventSession },
    //   sip_caps: [
    //     { name: '+g.oma.sip-im', value: null },
    //     { name: '+audio', value: null },
    //     { name: 'language', value: '\"en,fr\"' }
    //   ]
    // });
    // oSipSessionRegister.register();
  }
  call = () => {
    this.oSipSessionCall  = this.oSipStack.newSession('call-audio', this.oConfigCall);
    console.log('ICE IS: ' + this.oSipStack.ice_servers);
    this.oSipSessionCall.call('1060');
    if (this.oSipSessionCall) {
      this.oSipSessionCall.accept(this.oConfigCall);
    }
  }
}
