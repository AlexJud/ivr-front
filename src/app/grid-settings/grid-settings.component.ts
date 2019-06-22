import { Component, OnInit } from '@angular/core';
import { ModelService } from '../services/model.service'
import { NodeType, SpecifierNode, Node } from '../graph/nodes/nodes';
import { Options } from '../graph/nodeProps/optionStrings';
import { EventService } from '../services/event.service';
import { MatTableDataSource } from '@angular/material/table';
import { Subscriber, BehaviorSubject } from 'rxjs';

export interface Data {
  option: string;
  value: string;
}

export interface DisplayColumn {
  options?: string[];
  children: string[];
}


@Component({
  selector: 'app-grid-settings',
  templateUrl: './grid-settings.component.html',
  styleUrls: ['./grid-settings.component.scss']
})
export class GridSettingsComponent implements OnInit {
  isInput: boolean  //Проверяем был ли ввод в какой-нить Input
  currentNode: Node;  //Здесь храним текущий объект
  tableData: any;
  isOption: boolean;
  isChildren: boolean;
  displayedColumnsForChildren: string[];
  displayedColumnsForOptions: string[];
  // dataSource = []; //= DATA_SOURCE for table;
  dataSource: any;
  optionsData = {};
  childrenData = {};
  columnMap: Map<string, DisplayColumn>; //Map to store displayed columns

  constructor(private _modelService: ModelService,
              private _eventService: EventService) {
    this.isOption = false;
    this.isChildren = false;
    this.columnMap = new Map();
    this.tableData = {};
  }

  buildDataSource() {
    this._modelService.model.map( (node) => {
      switch(node.constructor.name) {
        case NodeType.ActionNode: {
          this.optionsData[node.id] = [
            {option: Options.TEXT_FOR_SYNTHESIZE, value: node.props[0]},
            {option: Options.ASR_OPTION, value: node.props[1]}
          ]
          this.childrenData[node.id] = [];
          if(node.children[0] !== null) {
            this.childrenData[node.id] =
            [
              {value: node.children[0].id}
            ]
          }
          this.columnMap.set(node.id, {
            options: ['option', 'value'],
            children: ['value']
          })
          break;
        }
        case NodeType.ClassifierNode: {
          if(node.children[0] !== null) {
            this.childrenData[node.id] = [];
            node.children.map((child) => {
              this.childrenData[node.id].push(
                {
                  value: child.id, keywords: child.match
                }
              );
            });
          }
          this.columnMap.set(node.id, {
            children: ['value', 'keywords']
          });
          break;
        }
        case NodeType.ExtractNode: {
          this.optionsData[node.id] = [
            {option: Options.VAR_NAME, value: node.props['varName'] === undefined ? '' : node.props['varName']},
            {option: Options.RAW_VAR_NAME, value: node.props['rawVarName'] === undefined ? '' : node.props['rawVarName']},
            {option: Options.KEYWORDS, value: node.props['match'] === undefined ? '' : node.props['match']}
          ]
          this.childrenData[node.id] = [];
          if(node.children[0] !== null && node.children.length !== 0) {
            this.childrenData[node.id] = 
            [
              {value: node.children[0].id}
            ];
          }
          this.columnMap.set(node.id, {
            options: ['option', 'value'],
            children: ['value']
          })
          break;
        }
        case NodeType.SpecifierNode: {
          node as SpecifierNode;
          this.optionsData[node.id] = [
            {
              varName: node.props.varName === undefined ? '' : node.props.varName,
              synthText: node.props.synthText === undefined ? '' : node.props.synthText,
              asrOpt: node.props.asrOpt === undefined ? '' : node.props.asrOpt,
              grammar: node.props.grammar === undefined ? '' : node.props.grammar,
              keywords: node.props.keywords === undefined ? '' : node.props.keywords,
              repeatCount: node.props.repeat === undefined ? '' : node.props.repeat
            }
          ];
          this.childrenData[node.id] = [];
          if(node.children[0] !== null && node.children.length !== 0) {
            this.childrenData[node.id] = 
            [
              {value: node.children[0].id}
            ]
          }
          this.columnMap.set(node.id, {
            options: ['varName', 'synthText', 'asrOpt', 'grammar', 'keywords', 'repeatCount'],
            children: ['value']
          })
          break;
        }
      }
    })
  }

  ngOnInit() {
    this.buildDataSource();
    this._eventService.on('showProps', (data) => {
      this.setDataSource(data.type, data.node)
      this.setColumns(data.node);
    });
    this._eventService.on('addNode', () => {
      this.buildDataSource();
    });
  }

  private setDataSource(type: string, nodeId: string) {
    if(type === 'options') {
      this.dataSource = new MatTableDataSource(this.optionsData[nodeId]); 
      this.isChildren = false;
      this.isOption = true;
    }
    if(type === 'children') {
      this.dataSource = new MatTableDataSource(this.childrenData[nodeId]);
      this.isOption = false;
      this.isChildren = true;
    }
    this.currentNode = this._modelService.getNode(nodeId);
  }
  private setColumns(id: string) {
    this.displayedColumnsForChildren = this.columnMap.get(id).children;
    this.displayedColumnsForOptions = this.columnMap.get(id).options;
  }
  onChange(event: Event) {
    if (event.constructor.name === 'InputEvent') {
      this.isInput = true;
    }
    if (event.constructor.name === 'FocusEvent') {
      if(this.isInput) {
        this.changeNode();
        this.isInput = false;
      }
    }
  }

  changeNode() {
    if (this.isChildren) {
      this.currentNode.children = this.dataSource.data;
    } else {
      // console.log(this.dataSource.data);
      let options = this.dataSource.data.map((item) => {
        return item.value;
      })
      this.currentNode.props = options;
    }
  }
}
