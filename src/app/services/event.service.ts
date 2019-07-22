import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';

@Injectable()
export class EventService {
  public _events: EventEmitter = new EventEmitter();


}
