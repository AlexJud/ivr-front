import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-node-settings-panel',
  templateUrl: './node-settings-panel.component.html',
  styleUrls: ['./node-settings-panel.component.scss']
})
export class NodeSettingsPanelComponent implements OnInit {
  asrType = ["Слитное распознавание", "Распознавание по грамматике"]
  step = 0;

  constructor() { }

  ngOnInit() {
  }
  
  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }



}
