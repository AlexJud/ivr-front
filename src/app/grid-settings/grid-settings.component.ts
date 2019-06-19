import { Component, OnInit } from '@angular/core';
import { ModelService } from '../services/model.service'
import { NodeType } from '../graph/nodes/nodes';
import { Options } from '../graph/nodeProps/optionStrings';

export interface Data {
  option: string;
  value: string;
}

const DATA_SOURCE: Data[] = [
  {option: '', value: 'Hydrogen'},
  {option: '', value: 'Helium'},
  {option: '', value: 'Lithium'},
  {option: '', value: 'Beryllium'}
];


@Component({
  selector: 'app-grid-settings',
  templateUrl: './grid-settings.component.html',
  styleUrls: ['./grid-settings.component.scss']
})
export class GridSettingsComponent implements OnInit {
  isOption = true;
  displayedColumns: string[] = ['option', 'value'];
  dataSource; //= DATA_SOURCE;
  optionsData = {};
  childrenData = {};


  constructor(private _modelService: ModelService) {

  }

  buildDataSource() {
    this._modelService.model.map( (node) => {
      switch(node.constructor.name) {
        case NodeType.ActionNode: {
          this.optionsData[node.id] = [
            {option: Options.TEXT_FOR_SYNTHESIZE, value: node.props[0]},
            {option: Options.ASR_OPTION, value: node.props[1]}
          ]
          this.childrenData[node.id] = [
            {option: }
          ]
        }
        // case NodeType.ClassifierNode: {
        //   this.MODEL[node.id] = [
        //     {option: 'Текст для синтеза', value: node.props[0]},
        //   ]
        // }
      }
    })
  }

  ngOnInit() {
    this.buildDataSource();
    this.dataSource = this.optionsData['root'];
  }

}
