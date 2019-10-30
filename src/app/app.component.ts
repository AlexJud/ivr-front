import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ModelService } from './services/model.service';
import { EventService } from './services/event.service';
import {HttpService} from './services/http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements  OnInit{


  title = 'voice-ivr-demo';
  private filesScenarios;

  constructor(private modelService: ModelService, private httpService: HttpService) {
    this.modelService.init();
  }

  ngOnInit(): void {
   this.httpService.getListScenarios().subscribe(data => this.filesScenarios = data)
  }
}
