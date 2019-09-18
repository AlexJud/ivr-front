import { Injectable } from '@angular/core';
import { EventService } from './event.service';
import * as Stomp from 'stompjs'

@Injectable()
export class WebSocketAPI {
    // webSocketEndPoint: string = 'wss://192.168.1.74:8080/wss';
    topic: string = "/topic/greetings";
    stompClient: any;
    logStyle = 'background: #222; color: #bada55'

    constructor(private _eventService: EventService) {
    }

    connect() {
        const _this = this;
        console.log("Initialize WebSocket Connection");
        let url = window.location.hostname
        this.stompClient = Stomp.client('wss://' + url + ':8080' + '/wss');
        this.stompClient.connect({}, function (frame) {
            _this._eventService._events.emit('socketConnected')
            _this.stompClient.subscribe('/ivr/dialog', function (sdkEvent) {
                _this.onMessageReceived(sdkEvent)
            });
        },
        (error) => {
            console.log("errorCallBack -> " + error)
            if(error.indexOf('Lost connection') !== -1) {
                _this._eventService._events.emit('socketLost')
            }
        });
    }

    disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
        }
        console.log("Disconnected");
    }

    send(message) {
        this.stompClient.send("/app/echo", {}, JSON.stringify(message));
    }

    onMessageReceived(message) {
        console.log("Message Received from Server :: " + message);
        this._eventService._events.emit('messageReceived', message)
    }
}