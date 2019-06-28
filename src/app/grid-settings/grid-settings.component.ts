import { Component, OnInit } from '@angular/core';
import { ModelService } from '../services/model.service'
import { NodeType, SpecifierNode, Node, ValidateNode } from '../graph/nodes/nodes';
import { Options } from '../graph/nodeProps/optionStrings';
import { EventService } from '../services/event.service';
import { MatTableDataSource } from '@angular/material/table';
import { Subscriber, BehaviorSubject } from 'rxjs';
import { SpecifierProps } from '../graph/nodeProps/specifierProps';

// export interface Data {
//   option: string;
//   value: string;
// }

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
          if(node.edgeList[0] !== null && node.edgeList.length !== 0) {
            this.childrenData[node.id] =
            [
              {id: node.edgeList[0].id}
            ]
          }
          this.columnMap.set(node.id, {
            options: ['option', 'value'],
            children: ['id']
          })
          break;
        }
        case NodeType.ClassifierNode: {
          if(node.edgeList[0] !== null) {
            this.childrenData[node.id] = [];
            node.edgeList.map((child) => {
              this.childrenData[node.id].push(
                {
                  id: child.id, keywords: child.match
                }
              );
            });
          }
          this.columnMap.set(node.id, {
            children: ['id', 'keywords']
          });
          break;
        }
        case NodeType.ExtractNode: {
          console.log('PROPS: ', node.props)
          if ( node.props.length === 0 || node.props == null) {
            this.optionsData[node.id] = [
              {option: Options.VAR_NAME, value: node.props['varName'] === undefined ? '' : node.props['varName']},
              {option: Options.RAW_VAR_NAME, value: node.props['rawVarName'] === undefined ? '' : node.props['rawVarName']},
              {option: Options.KEYWORDS, value: node.props['match'] === undefined ? '' : node.props['match']}
            ]
          } else {
            this.optionsData[node.id] = node.props;
          }
          this.childrenData[node.id] = [];
          if(node.edgeList[0] !== null && node.edgeList.length !== 0) {
            this.childrenData[node.id] = 
            [
              {id: node.edgeList[0].id}
            ];
          }
          this.columnMap.set(node.id, {
            options: ['option', 'value'],
            children: ['id']
          })
          break;
        }
        case NodeType.SpecifierNode: {
          node as SpecifierNode;
          let specifierProps = new SpecifierProps();
          if(node.props.length === 0 || node.props == null) {
            this.optionsData[node.id] = [specifierProps];
          } else {
            this.optionsData[node.id] = node.props;
          }
          
          this.childrenData[node.id] = [];
          if(node.edgeList[0] !== null && node.edgeList.length !== 0) {
            this.childrenData[node.id] = 
            [
              {id: node.edgeList[0].id}
            ]
          }
          this.columnMap.set(node.id, {
            options: ['varName', 'synthText', 'asrOptions', 'grammar', 'keywords', 'repeat'],
            children: ['id']
          })
          break;
        }
        case NodeType.EndNode: {
          this.optionsData[node.id] = [
            {option: Options.TEXT_FOR_SYNTHESIZE, value: node.props[0]},
          ]
          this.childrenData[node.id] = [];
          this.columnMap.set(node.id, {
            options: ['option', 'value'],
            children: ['id']
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
    console.log(this.dataSource.data);
    switch (this.currentNode.constructor.name) {
      case NodeType.ActionNode: {
        if (this.isChildren) {
          this.currentNode.edgeList = this.dataSource.data;
        } else {
          let options = this.dataSource.data.map((item: any) => {
            return item.value;
          })
          this.currentNode.props = options;                
        }
        break;
      }
      case NodeType.ExtractNode: {
        if (this.isChildren) {
          this.currentNode.edgeList = this.dataSource.data;
        } else {
            this.currentNode.props.varName = this.dataSource.data[0].value;
            this.currentNode.props.rawVarName = this.dataSource.data[1].value;
            this.currentNode.props.match = this.dataSource.data[2].value;
        }
        break;
      }
      case NodeType.ClassifierNode: {
        if (this.isChildren) {
          this.dataSource.data.map((element, index) => {
            this.currentNode.edgeList[index].id = element.id;
            this.currentNode.edgeList[index].match = (element.keywords.split(',').map((item) => item.trim()));
          });
        } else {
            this.currentNode.edgeList = this.dataSource.data;
        }
        break;
      }
      case NodeType.SpecifierNode: {
        if(this.isChildren) {
          this.currentNode.edgeList = this.dataSource.data;
        } else {
          this.dataSource.data.forEach(element => {
            if (!(element.keywords instanceof Array)) {
              element.keywords = element.keywords.split(',').map((item) => item.trim());
            }
          });
          this.currentNode.props = this.dataSource.data;
        }
        console.log(this.currentNode.props)
        break;
      }
      case NodeType.EndNode: {
        if(this.isChildren) {
          this.currentNode.edgeList = this.dataSource.data;
        } else {
          let options = this.dataSource.data.map((item: any) => {
            return item.value;
          })
          this.currentNode.props = options;
        }
      }
    }
  }
}
