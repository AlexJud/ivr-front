import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {ModelService} from '../services/model.service';
import {EventService} from '../services/event.service';
import {ViewNode} from '../view-model-nodes/viewNode';
import {FormControl} from '@angular/forms';
import {HttpService} from '../services/http.service';
import {GrammarService} from '../services/grammar.service';
import {Strings} from '../graph/nodeProps/optionStrings';
import {MatSnackBar} from '@angular/material';
import {NodeType} from '../graph/nodes/nodes';
import {Events} from '../models/events';
import {GraphViewModel, Vertex, VertexResult} from '../models/vertex';
import * as _ from 'lodash';

@Component({
  selector: 'app-node-settings-panel',
  templateUrl: './node-settings-panel.component.html',
  styleUrls: ['./node-settings-panel.component.scss']
})
export class NodeSettingsPanelComponent implements OnInit {
  @ViewChild('file', {static: false}) file: ElementRef;
  isProgress = false;
  currentNode: Vertex;
  currentUserVar: VertexResult=new VertexResult();
  model;
  myControl = new FormControl();
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER];

  matChildren = false;

  vmodel :GraphViewModel;
  userVars: any[] = []

  panelOpenState = false;

  constructor(private modelService: ModelService,
              private _eventService: EventService,
              private _http: HttpService,
              private _grammarService: GrammarService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.vmodel = this.modelService.graphViewModel;
    console.log('CHECH ID')
    this.vmodel.events.addListener(Events.nodeselected, (obj) => {
      this.setDataSource(obj.id);
      this.matChildren = !obj.vertex;
    });

    // this.setDataSource({node: 'root'})
    this.currentNode = this.vmodel.graph.get('root');

    // this.model = this.modelService.model;

  }

  setDataSource(cellId: string) {
    // this.currentNode = this.modelService.viewModel.get(data.node)
    this.currentNode = this.vmodel.graph.get(cellId);
    if (this.currentNode.type === NodeType.SystemNode){
     this.userVars = this.filterUserVars()
    }
    console.log(this.currentNode);
  }

  setValuetoSysVar(event){
    const value = event.target.value
    this.currentUserVar.sysname = value;
    this.currentNode.props.result.name = this.currentUserVar.name
    this.currentNode.props.result.sysname = value
  }



  // changeGrammar(selected: string, index: number) {
  //   switch(selected) {
  //     case Strings.LOAD_GRAMMAR: {
  //       this.file.nativeElement.click();
  //       break
  //     }
  //     case Strings.FILE_GRAMMAR: {
  //       this.currentNode.props.forEach(prop => {
  //         if (prop.name === Strings.GRAMMAR) {
  //           prop.value.disabled = false
  //         }
  //       })
  //       break
  //     }
  //     case Strings.BUILTIN_GRAMMAR: {
  //       this.currentNode.props.forEach(prop => {
  //         if (prop.name === Strings.GRAMMAR) {
  //           prop.value.disabled = true
  //         }
  //       })
  //       break
  //     }
  //   }
  // }

  show(){
    // console.log('EVENT',event)
    console.log('DATA',this.currentUserVar)
  }

  uploadFile(event: any) {
    // this.isProgress = true
    // this._http.sendGrammarFile(event.target.files[0]).subscribe((response) => {
    //   this._grammarService.grammars.push(event.target.files[0].name)
    //   this.currentNode.props.forEach(item => {
    //     if (item.name === Strings.GRAMMAR) {
    //       item.value.value.push(event.target.files[0].name)
    //       item.value.selected = event.target.files[0].name;
    //     }
    //     this.isProgress = false
    //   })
    // }, error => {
    //   this.showMessage('Загрузка не удалась', 'Закрыть')
    //   this.isProgress = false
    //   console.log(error);
    // });
  }

  showMessage(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  onHover(id: string, focus: boolean) {
    this.vmodel.events.emit(Events.cellhighlight, {id, focus});
  }
  emitUpdateModel(){
    this.vmodel.events.emit(Events.updatemodel, this.currentNode.id)
  }



  filterChildEdges(child: Vertex, parentId): Array<string> {
    let edges = child.props.edges.find(edge => edge.parent.id === parentId);
    return edges ? edges.match : [];
  }
  filterUserVars():Array<any>{
    console.log('TRACE FILTER')
    let array = []
    this.vmodel.graph.forEach(node => {
      if (node.type === NodeType.SpecifierNode) {
        if(node.props.result.name){
          array.push({name:node.props.result.name,value:node.props.result})
        }
      }
    })
    console.log('ARRAY VARS',array)
    return array;
  }

  add(event: MatChipInputEvent, id: string): void {

    const input = event.input;
    const value = event.value;
    if (!value) {
      return;
    }

    let vertex = this.vmodel.graph.get(id);
    let edge = vertex.props.edges.find(edge => edge.parent.id === this.currentNode.id);
    edge.match.push(value);

    // if (edge.parent.type === NodeType.SpecifierNode) {
    //   edge.parent.props.result.seek.push(value);
    // }
    // switch(this.currentNode.type) {
    //   case NodeType.BranchNode: {
    //     if ((value || '').trim()) {
    //       this.currentNode.edgeList.forEach(edge => {
    //         if (edge.id === id) {
    //           edge.match.push(value.trim())
    //           this._eventService._events.emit('updateCell', this.currentNode.id)
    //         }
    //       });
    //     }
    //     break
    //   }
    //   case NodeType.SpecifierNode: {
    //     if ((value || '').trim()) {
    //       this.currentNode.props.forEach(prop => {
    //         if (prop.name === 'Ключевые слова') {
    //           prop.value.push(value.trim())
    //           this._eventService._events.emit('updateCell', this.currentNode.id)
    //         }
    //       });
    //     }
    //     break
    //   }
    // }
    // if (input) {
    //   input.value = '';
    // }
    input.value = '';
    this.vmodel.events.emit(Events.updatemodel);
  }

  remove(key: string, childId: string): void {
    let vertex = this.vmodel.graph.get(childId);
    let edge = vertex.props.edges.find(edge => edge.parent.id === this.currentNode.id);
    _.pull(edge.match, key);

    // if (edge.parent.type === NodeType.SpecifierNode) {
    //   _.pull(edge.parent.props.result.seek, key);
    // }
    // let index: number
    // switch(this.currentNode.type) {
    //   case NodeType.BranchNode: {
    //     this.currentNode.edgeList.forEach(edge => {
    //       if (edge.id === id) {
    //         index = edge.match.indexOf(key);
    //       }
    //       if (index >= 0) {
    //         edge.match.splice(index, 1);
    //       }
    //     })
    //     break
    //   }
    //   case NodeType.SpecifierNode: {
    //     this.currentNode.props.forEach(prop => {
    //       if(prop.name === Strings.KEYWORDS) {
    //         index = prop.value.indexOf(key);
    //       }
    //       if (index >= 0) {
    //         prop.value.splice(index, 1);
    //       }
    //     })
    //     break
    //   }
    // }
    this.vmodel.events.emit(Events.updatemodel);

  }
}
