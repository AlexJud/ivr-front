import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModelService } from '../services/model.service'
import { NodeType, Node } from '../graph/nodes/nodes';
import { Strings, CellType } from '../graph/nodeProps/optionStrings';
import { EventService } from '../services/event.service';
import { MatTableDataSource } from '@angular/material/table';
import { GrammarService } from '../services/grammar.service';
import { HttpService } from '../services/http.service';
import { ActionProps } from '../graph/nodeProps/actionProps';
import { ViewNode } from '../view-model-nodes/view.model-node';
import { MatSelect } from '@angular/material';

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
  // tableData: any;
  isOption: boolean;
  isChildren: boolean;
  // displayedColumnsForChildren: string[];
  // displayedColumnsForOptions: string[];
  // dataSource = []; //= DATA_SOURCE for table;
  dataSource: MatTableDataSource<any>
  columnsData: any
  displayedColumns: any
  // optionsData = {};
  // childrenData = {};
  // columnMap: Map<string, DisplayColumn>; //Map to store displayed columns
  sRowindex: number
  viewNode: ViewNode

  constructor(private _modelService: ModelService,
              private _eventService: EventService,
              private _grammarService: GrammarService,
              private _http: HttpService) {
    this.isOption = false;
    this.isChildren = false;
    // this.columnMap = new Map();
    // this.tableData = {};
  }

  ngOnInit() {
    this.setDataSource('root', 'options')
    this._eventService._events.addListener('showProps', (data) => {
      this.setDataSource(data.node, data.type)
    });
    this._eventService._events.addListener('addNode', () => {
      console.log('addNode EVENT RECIEVED')
    });
    this._eventService._events.addListener('deleteNode', () => {
      console.log('deleteNode EVENT RECIEVED')
    });
  }

  private setDataSource(nodeId: string, type: string) {
    this.viewNode = this._modelService.viewModel.get(nodeId)
    // this.currentNode = this._modelService.getNode(nodeId);
    if(type === 'options') {
      this.dataSource =  new MatTableDataSource(this.viewNode.options)
      this.columnsData = this.viewNode.optionTableView.columnsData
      this.displayedColumns = this.viewNode.optionTableView.displayedColumns
    }
    if(type === 'children') {
      this.dataSource = new MatTableDataSource(this.viewNode.edgeList)
      this.columnsData = this.viewNode.childrenTableView.columnsData
      this.displayedColumns = this.viewNode.childrenTableView.displayedColumns
    }
  }

  // onChange(event: Event) {
  //   if (event.type === 'input') {
  //     this.isInput = true;
  //   }
  //   if (event.type.indexOf('focus') !== -1) {
  //     if(this.isInput) {
  //       this.changeNode();
  //       this.isInput = false;
  //     }
  //   }
  //   console.log(this._modelService.viewModel);
  // }

  changeGrammar(element: any, colomnId: string, index: number) {
    if(element[colomnId].selected === Strings.FILE_GRAMMAR) {
      for(let i = 0; i < this.viewNode.options.length; i++) {
        switch(this,this.viewNode.type) {
          case NodeType.EndNode:
          case NodeType.ActionNode: {
            if(this.viewNode.options[i].name === 'Грамматика') {
              this.viewNode.options[i].value.selected = ''
            }
            break;
          }
          case NodeType.SpecifierNode: {
            if(i === index) {
              this.viewNode.options[i].grammar.selected = ''
            }
            break;
          }
        }
      }
    } else if(element[colomnId].selected === Strings.BUILTIN_GRAMMAR) {
      this.viewNode.options.forEach( node => {
        if(node.name === 'Грамматика') {
          node[colomnId].selected = null
        }
      })
    } else if (element[colomnId].selected === Strings.LOAD_GRAMMAR){
      this.file.nativeElement.click();
    }
  }

  uploadFile(event: any) {
    this._http.sendGrammarFile(event.target.files[0]).subscribe((response) => {
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

  // changeNode() {
  //   console.log(this.dataSource.data);
  //   switch (this.currentNode.constructor.name) {
  //     case NodeType.ActionNode: {
  //       if (this.isChildren) {
  //         this.currentNode.edgeList = this.dataSource.data;
  //       } else {
  //         let props = new ActionProps()
  //         this.dataSource.data.forEach((item: any) => {
  //           switch(item.option) {
  //             case Strings.TEXT_FOR_SYNTHESIZE: {
  //               props.synthText = item.value;
  //               break;
  //             }
  //             case Strings.ASR_OPTION: {
  //               props.options = item.value;
  //               break;
  //             }
  //             case Strings.ASR_TYPE: {
  //               if(item.value === Strings.BUILTIN_GRAMMAR) {
  //                 props.grammar = "http://localhost/theme:graph"
  //               } else if(item.value === Strings.FILE_GRAMMAR) {
  //                 props.grammar = "/etc/asterisk/" + item.value
  //               } else if ( Array.isArray(item.value)) {
  //                 props.grammar = "http://localhost/theme:graph"
  //               }
  //               break;
  //             }
  //           }
  //         })
  //         this.currentNode.props = props;
  //       }
  //       break;
  //     }
  //     case NodeType.ExtractNode: {
  //       if (this.isChildren) {
  //         this.currentNode.edgeList = this.dataSource.data;
  //       } else {
  //           this.currentNode.props.varName = this.dataSource.data[0].value;
  //           this.currentNode.props.rawVarName = this.dataSource.data[1].value;
  //           this.currentNode.props.match = this.dataSource.data[2].value;
  //       }
  //       break;
  //     }
  //     case NodeType.ClassifierNode: {
  //       if (this.isChildren) {
  //         this.dataSource.data.map((element, index) => {
  //           this.currentNode.edgeList[index].id = element.id;
  //           this.currentNode.edgeList[index].match = (element.keywords.split(',').map((item) => item.trim()));
  //         });
  //       } else {
  //           this.currentNode.edgeList = this.dataSource.data;
  //       }
  //       break;
  //     }
  //     case NodeType.SpecifierNode: {
  //       if(this.isChildren) {
  //         this.currentNode.edgeList = this.dataSource.data;
  //       } else {
  //         this.dataSource.data.forEach(element => {
  //           if (!(element.keywords instanceof Array)) {
  //             element.keywords = element.keywords.split(',').map((item) => item.trim());
  //           }
  //         });
  //         this.currentNode.props = this.dataSource.data;
  //       }
  //       console.log(this.currentNode.props)
  //       break;
  //     }
  //     case NodeType.EndNode: {
  //       if(this.isChildren) {
  //         this.currentNode.edgeList = this.dataSource.data;
  //       } else {
  //         let options = this.dataSource.data.map((item: any) => {
  //           return item.value;
  //         })
  //         this.currentNode.props = options;
  //       }
  //     }
  //   }
  // }
  // buildDataSource() {
  //   this._modelService.model.map( (node) => {
  //     switch(node.constructor.name) {
  //       case NodeType.ActionNode: {
  //         this.optionsData[node.id] = [
  //           {option: Strings.TEXT_FOR_SYNTHESIZE, value: node.props.synthText, isSelect: false},
  //           {option: Strings.ASR_OPTION, value: node.props.options, isSelect: false},
  //           {option: Strings.ASR_TYPE, value: ['Слитное распознавание', 'Распознавание по грамматике'], isSelect: true, selected: ''},
  //           {option: Strings.GRAMMAR, value: this._grammarService.grammars, isSelect: true, selected: '', disabled: true}
  //         ]
  //         this.childrenData[node.id] = [];
  //         if(node.edgeList[0] !== null && node.edgeList.length !== 0) {
  //           this.childrenData[node.id] =
  //           [
  //             {id: node.edgeList[0].id}
  //           ]
  //         }
  //         this.columnMap.set(node.id, {
  //           options: ['option', 'value'],
  //           children: ['id']
  //         })
  //         break;
  //       }
  //       case NodeType.ClassifierNode: {
  //         if(node.edgeList[0] !== null) {
  //           this.childrenData[node.id] = [];
  //           node.edgeList.map((child) => {
  //             this.childrenData[node.id].push(
  //               {
  //                 id: child.id, keywords: child.match
  //               }
  //             );
  //           });
  //         }
  //         this.columnMap.set(node.id, {
  //           children: ['id', 'keywords']
  //         });
  //         break;
  //       }
  //       case NodeType.ExtractNode: {
  //         console.log('PROPS: ', node.props)
  //         if ( node.props.length === 0 || node.props == null) {
  //           this.optionsData[node.id] = [
  //             {option: Strings.VAR_NAME, value: node.props['varName'] === undefined ? '' : node.props['varName']},
  //             {option: Strings.RAW_VAR_NAME, value: node.props['rawVarName'] === undefined ? '' : node.props['rawVarName']},
  //             {option: Strings.KEYWORDS, value: node.props['match'] === undefined ? '' : node.props['match']}
  //           ]
  //         } else {
  //           this.optionsData[node.id] = node.props;
  //         }
  //         this.childrenData[node.id] = [];
  //         if(node.edgeList[0] !== null && node.edgeList.length !== 0) {
  //           this.childrenData[node.id] = 
  //           [
  //             {id: node.edgeList[0].id}
  //           ];
  //         }
  //         this.columnMap.set(node.id, {
  //           options: ['option', 'value'],
  //           children: ['id']
  //         })
  //         break;
  //       }
  //       case NodeType.SpecifierNode: {
  //         node as SpecifierNode;
  //         let specifierProps = new SpecifierProps();
  //         if(node.props.length === 0 || node.props == null) {
  //           this.optionsData[node.id] = [specifierProps];
  //         } else {
  //           this.optionsData[node.id] = node.props.map(item => {
  //             specifierProps = new SpecifierProps()
  //             specifierProps.asrOptions = item.asrOptions
  //             specifierProps.builtinRecogAfterRepeat = item.builtinRecogAfterRepeat
  //             specifierProps.keywords = item.keywords
  //             specifierProps.repeat = item.repeat
  //             specifierProps.synthText = item.synthText
  //             specifierProps.varName = item.varName
  //             if(item.grammar.indexOf('localhost')) {
  //               specifierProps.selected = Strings.BUILTIN_GRAMMAR
  //             } else {
  //               specifierProps.selected = Strings.FILE_GRAMMAR
  //               specifierProps.disabled = false;
  //             }
  //             return specifierProps;
  //           })
  //         }
          
  //         this.childrenData[node.id] = [];
  //         if(node.edgeList[0] !== null && node.edgeList.length !== 0) {
  //           this.childrenData[node.id] = 
  //           [
  //             {id: node.edgeList[0].id}
  //           ]
  //         }
  //         this.columnMap.set(node.id, {
  //           options: ['checked', 'varName', 'synthText', 'asrOptions', 'recognizeWay','grammar', 'keywords', 'repeat'],
  //           children: ['id']
  //         })
  //         break;
  //       }
  //       case NodeType.EndNode: {
  //         this.optionsData[node.id] = [
  //           {option: Strings.TEXT_FOR_SYNTHESIZE, value: node.props[0]},
  //         ]
  //         this.childrenData[node.id] = [];
  //         this.columnMap.set(node.id, {
  //           options: ['option', 'value'],
  //           children: ['id']
  //         })
  //         break;
  //       }
  //     }
  //   })
  // }
}
