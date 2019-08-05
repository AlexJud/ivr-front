import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { AppComponent } from './../app.component';
import { Injectable } from '@angular/core';
import { EventService } from './event.service';

@Injectable()
export class WebSocketAPI {
    webSocketEndPoint: string = 'https://192.168.1.74:8080/wss';
    topic: string = "/topic/greetings";
    stompClient: any;
    // appComponent: AppComponent;

    // constructor(appComponent: AppComponent){
    //     this.appComponent = appComponent;
    // }
    constructor(private _eventService: EventService) {

    }
    _connect() {
        console.log("Initialize WebSocket Connection");
        let ws = new SockJS(this.webSocketEndPoint);
        this.stompClient = Stomp.over(ws);
        const _this = this;
        _this.stompClient.connect({}, function (frame) {
            _this._eventService._events.emit('socketConnected')
            _this.stompClient.subscribe(_this.topic, function (sdkEvent) {
                _this.onMessageReceived(sdkEvent);
            });
            //_this.stompClient.reconnect_delay = 2000;
        }, (error) =>{
            console.log("errorCallBack -> " + error)
        if(error.indexOf('Lost connection') !== -1) {
            _this._eventService._events.emit('socketLost')
        }
        });
    };

    _disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
        }
        console.log("Disconnected");
    }

    // on error, schedule a reconnection attempt
    // errorCallBack(error) {
    //     let _this = this
    //     console.log("errorCallBack -> " + error)
    //     if(error.indexOf('Lost connection') !== -1) {
    //         _this._eventService._events.emit('socketLost')
    //     }
    //     setTimeout(() => {
    //         this._connect();
    //     }, 5000);
    // }

	/**
	 * Send message to sever via web socket
	 * @param {*} message 
	 */
    _send(message) {
        console.log("calling logout api via web socket");
        this.stompClient.send("/app/hello", {}, JSON.stringify(message));
    }

    onMessageReceived(message) {
        console.log("Message Recieved from Server :: " + message);
        this._eventService._events.emit('messageRecieved', message)
        // this.appComponent.handleMessage(JSON.stringify(message.body));
    }
}