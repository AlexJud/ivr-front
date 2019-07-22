import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModelService } from '../services/model.service'
import { NodeType, SpecifierNode, Node, ValidateNode } from '../graph/nodes/nodes';
import { Strings, CellType } from '../graph/nodeProps/optionStrings';
import { EventService } from '../services/event.service';
import { MatTableDataSource } from '@angular/material/table';
import { Subscriber, BehaviorSubject } from 'rxjs';
import { SpecifierProps } from '../graph/nodeProps/specifierProps';
import { GrammarService } from '../services/grammar.service';
import { Input } from '@angular/compiler/src/core';
import { HttpService } from '../services/http.service';
import { ActionProps } from '../graph/nodeProps/actionProps';

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
  @ViewChild("file", {static: false}) file: ElementRef
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
  sRowindex: number

  constructor(private _modelService: ModelService,
              private _eventService: EventService,
              private _grammarService: GrammarService,
              private _http: HttpService) {
    this.isOption = false;
    this.isChildren = false;
    this.columnMap = new Map();
    this.tableData = {};
  }

  buildDataSource() {
    console.log("AAAAA");
    console.log(this._modelService.model);
    this._modelService.model.map( (node) => {
      switch(node.constructor.name) {
        case NodeType.ActionNode: {
          this.optionsData[node.id] = [
            {option: Strings.TEXT_FOR_SYNTHESIZE, value: node.props.synthText, isSelect: false},
            {option: Strings.ASR_OPTION, value: node.props.options, isSelect: false},
            {option: Strings.ASR_TYPE, value: ['Слитное распознавание', 'Распознавание по грамматике'], isSelect: true, selected: ''},
            {option: Strings.GRAMMAR, value: this._grammarService.grammars, isSelect: true, selected: '', disabled: true}
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
              {option: Strings.VAR_NAME, value: node.props['varName'] === undefined ? '' : node.props['varName']},
              {option: Strings.RAW_VAR_NAME, value: node.props['rawVarName'] === undefined ? '' : node.props['rawVarName']},
              {option: Strings.KEYWORDS, value: node.props['match'] === undefined ? '' : node.props['match']}
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
            this.optionsData[node.id] = node.props.map(item => {
              specifierProps = new SpecifierProps()
              specifierProps.asrOptions = item.asrOptions
              specifierProps.builtinRecogAfterRepeat = item.builtinRecogAfterRepeat
              specifierProps.keywords = item.keywords
              specifierProps.repeat = item.repeat
              specifierProps.synthText = item.synthText
              specifierProps.varName = item.varName
              if(item.grammar.indexOf('localhost')) {
                specifierProps.selected = Strings.BUILTIN_GRAMMAR
              } else {
                specifierProps.selected = Strings.FILE_GRAMMAR
                specifierProps.disabled = false;
              }
              return specifierProps;
            })
          }

          this.childrenData[node.id] = [];
          if(node.edgeList[0] !== null && node.edgeList.length !== 0) {
            this.childrenData[node.id] =
            [
              {id: node.edgeList[0].id}
            ]
          }
          this.columnMap.set(node.id, {
            options: ['checked', 'varName', 'synthText', 'asrOptions', 'recognizeWay','grammar', 'keywords', 'repeat'],
            children: ['id']
          })
          break;
        }
        case NodeType.EndNode: {
          this.optionsData[node.id] = [
            {option: Strings.TEXT_FOR_SYNTHESIZE, value: node.props[0]},
          ]
          this.childrenData[node.id] = [];
          this.columnMap.set(node.id, {
            options: ['option', 'value'],
            children: ['id']
          })
          break;
        }
      }
    });
  }

  ngOnInit() {
    this._eventService._events.addListener('modelReceived', () => {
      this.buildDataSource();
      this.setDataSource('options', 'root');
      this.setColumns('root');
    });
    this._eventService._events.addListener('showProps', (data) => {
      console.log("AAAAA");
      console.log(data);
      this.setDataSource(data.type, data.node);
      this.setColumns(data.node);
    });
    this._eventService._events.addListener('addNode', () => {
      this.buildDataSource();
    });
    this._eventService._events.addListener('deleteNode', () => {
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

  changeGrammar(element: any) {
    if(element.selected === Strings.FILE_GRAMMAR) {
      this.dataSource.data[this.dataSource.data.length - 1].disabled = false;
    } else if(element.selected === Strings.BUILTIN_GRAMMAR) {
      this.dataSource.data[this.dataSource.data.length - 1].disabled = true;
    } else if (element.selected === Strings.LOAD_GRAMMAR){
      this.file.nativeElement.click();
    }
  }

  canItShow(element: any): boolean {
    switch(element.type) {
      case CellType.INPUT: return true;
      case CellType.SELECT: {
        if(element.hidden === 'undefined') {
          return true;
        } else if (element.hidden === true) {
          return false;
        } else {
          return true
        }
      }
      default: false
    }
  }

  uploadFile(event: any) {
    this._http.snedGrammarFile(event.target.files[0]).subscribe((response) => {
      this._grammarService.grammars.push(event.target.files[0].name)
      this.dataSource.data.forEach(item => {
        if (item.option === Strings.GRAMMAR) {
          item.selected = event.target.files[0].name;
        }
      })
      this.dataSource._updateChangeSubscription();
    }, error => {
      console.log(error);
    });
  }
  selectRow(index: number) {
    this.sRowindex = index
  }

  deleteRow(event: any) {
    this.dataSource.data.splice(this.sRowindex, 1);
    this.dataSource._updateChangeSubscription();
  }

  changeNode() {
    console.log(this.dataSource.data);
    switch (this.currentNode.constructor.name) {
      case NodeType.ActionNode: {
        if (this.isChildren) {
          this.currentNode.edgeList = this.dataSource.data;
        } else {
          let props = new ActionProps()
          this.dataSource.data.forEach((item: any) => {
            switch(item.option) {
              case Strings.TEXT_FOR_SYNTHESIZE: {
                props.synthText = item.value;
                break;
              }
              case Strings.ASR_OPTION: {
                props.options = item.value;
                break;
              }
              case Strings.ASR_TYPE: {
                if(item.value === Strings.BUILTIN_GRAMMAR) {
                  props.grammar = "http://localhost/theme:graph"
                } else if(item.value === Strings.FILE_GRAMMAR) {
                  props.grammar = "/etc/asterisk/" + item.value
                } else if ( Array.isArray(item.value)) {
                  props.grammar = "http://localhost/theme:graph"
                }
                break;
              }
            }
          })
          this.currentNode.props = props;
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
