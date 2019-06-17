import { Component, OnInit } from '@angular/core';

export interface Data {
  option: number;
  value: string;
}

const ELEMENT_DATA: Data[] = [
  {option: 1, value: 'Hydrogen'},
  {option: 2, value: 'Helium'},
  {option: 3, value: 'Lithium'},
  {option: 4, value: 'Beryllium'}
];
@Component({
  selector: 'app-grid-settings',
  templateUrl: './grid-settings.component.html',
  styleUrls: ['./grid-settings.component.scss']
})
export class GridSettingsComponent implements OnInit {
  displayedColumns: string[] = ['option', 'value'];
  dataSource = ELEMENT_DATA;
  constructor() { }

  ngOnInit() {
  }

}
