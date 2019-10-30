import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {ModelService} from '../../services/model.service';
import {EventService} from '../../services/event.service';
import {FormControl} from '@angular/forms';
import {HttpService} from '../../services/http.service';
import {GrammarService} from '../../services/grammar.service';
import {Strings} from '../../models/optionStrings';
import {MatSnackBar} from '@angular/material';
import {NodeType} from '../../models/types';
import {Events} from '../../models/events';
import {Vertex, VertexResult} from '../../models/vertex';
import {Edge} from '../../models/edge';
import * as _ from 'lodash';
import {GraphViewModel} from '../../models/graph-v-model';
import {startWith} from 'rxjs/operators';

// import {commands} from '../../models/commands';


@Component({
  selector: 'app-node-settings-panel',
  templateUrl: './node-settings-panel.component.html',
  styleUrls: ['./node-settings-panel.component.scss']
})
export class NodeSettingsPanelComponent implements OnInit {

  // commands =[
  //   {name: null, value:  'Нет комманд'},
  //   {name: 'saveToRedmine', value:  'Сохранить как задачу в RedMine'}
  // ]
  commands = [
    {name: null, value: 'Нет комманд'},
    // {name: 'SaveToRedMine', value: 'Сохранить как задачу в RedMine'}
  ];

  @ViewChild('file', {static: false}) file: ElementRef;
  isProgress = false;
  currentNode: Vertex;
  currentUserVar: VertexResult = new VertexResult();
  currentEdge: Edge;
  // currentEdges: Edge[];
  // commands;

  model;
  myControl = new FormControl();
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER];

  matChildren = false;

  vmodel: GraphViewModel;
  userVars: any[] = [];

  panelOpenState = false;

  constructor(private modelService: ModelService,
              private _eventService: EventService,
              private _http: HttpService,
              private _grammarService: GrammarService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.vmodel = this.modelService.graphViewModel;
    this.vmodel.events.addListener(Events.nodeselected, (cell) => {
      console.log('message recieved: ', cell);
      if (cell.vertex) {
        console.log('TRACE1 VERTEX', cell.vertex);
        this.currentEdge = null;
        this.setDataSource(cell.vertex);
      } else if (cell.edge) {
        console.log('TRACE2 EDGES', cell.edge);
        this.currentNode = null;
        this.setEdgeSelected(cell.edge);
        // if ( cell.node.source.id.indexOf('_')===0) {
        //   this.setEdgeSelected(cell.node.id,cell.node.source.id.substring(1));
        // } else {
        //   this.setEdgeSelected(cell.node.id, cell.node.source.id);
        // }
      } else {
        this.currentEdge = null;
        this.currentNode = null;
      }
      // this.matChildren = !obj.vertex;

    });

    // this.setDataSource({node: 'root'})
    this.currentNode = this.vmodel.graph.get('root');

    // this.model = this.modelService.model;

    this._http.getCommands().subscribe((data:any[]) => {
      data.forEach(rec => {
        console.log('Data get classes ',rec)
        this.commands.push({name:rec.name,value:rec.description})
      })
    })

  }

  setDataSource(cellId: string) {
    console.log('CELLID ', cellId);
    // this.currentNode = this.modelService.viewModel.get(data.node)
    this.currentNode = this.vmodel.graph.get(cellId);
    if (this.currentNode.type === NodeType.SystemNode) {
      this.userVars = this.filterUserVars();
    }
    console.log(this.currentNode);
  }

  setEdgeSelected(edge: Edge) {
    console.log('new edge selected', edge);
    // let edges = this.vmodel.edges.get(parentId);
    // this.currentEdges = array;
    this.currentEdge = edge;

    console.log('this.currentEdge', this.currentEdge);

  }

  setValuetoSysVar(event) {
    // const value = event.target.value
    // this.currentUserVar.sysname = value;
    // this.currentNode.props.result.name = this.currentUserVar.name
    // this.currentNode.props.result.sysname = value
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

  show() {
    // console.log('EVENT',event)
    console.log('DATA', this.currentUserVar);
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

  emitUpdateModel(event) {
    if (event.key === 'Enter') {
      this.currentNode.speech = this.currentNode.speech.substring(0, this.currentNode.speech.length - 1);
      this.vmodel.events.emit(Events.updatemodel, this.currentNode.id);
    }
  }

  changeEdgeColor() {
      let allEdges = this.vmodel.edges.get(this.currentEdge.parent.id)
      let edges =  allEdges.filter(edge => edge.error === true);
      if (edges.length > 1) {
        alert('Не можеть быть больше 2х красных стрелок');
        this.currentEdge.error = false;
      }
      if (edges.length <= 1) {
        // this.currentEdge.error = true;
        this.vmodel.events.emit(Events.updatemodel, null);
      } else {
        console.error('Ошибка переключения цвета стрелки. у родителя не найдены связи');
      }

  }

  // isChildrenExist(parentId: string) {
  //   let edges = this.vmodel.edges ? this.vmodel.edges.get(parentId) : null;
  //   return edges && edges.length > 0;
  // }


  // filterChildEdges(child: Vertex, parentId): Array<string> {
  //   // let edges = child.props.edges.find(edge => edge.parent.id === parentId);
  //   let edges = this.vmodel.edges.get(parentId);
  //   let edge = edges ? edges.find(item => item.child.id === child.id) : null;
  //   return edge ? edge.match : [];
  // }

  // filterEdges(parentId): Array<Edge> {
  //   let edges = this.vmodel.edges.get(parentId);
  //   // console.log('EDGES ',edges)
  //   return edges ? edges : [];
  // }

  filterUserVars(): Array<any> {
    console.log('TRACE FILTER');
    let array = [];

    // this.vmodel.graph.forEach(node => {
    //   if (node.type === NodeType.SpecifierNode) {
    //     if(node.props.result.name){
    //       array.push({name:node.props.result.name,value:node.props.result})
    //     }
    //   }
    // })


    console.log('ARRAY VARS', array);
    return array;
  }

  add(event: MatChipInputEvent): void {

    console.log('EVENT CURRENT EDGES', event.value);

    const input = event.input;
    const value = event.value;
    if (!value) {
      return;
    }

    // this.currentEdges.forEach(edge => {
    //   console.log('EDGE ADD NEW WORD',edge.match)
    //   console.log('EDGE ADD NEW WORD 2',value)
    //   edge.match.push(value)
    // })
    this.currentEdge.match.push(value);
    input.value = '';
    this.vmodel.events.emit(Events.updatemodel);
  }

  remove(key: string): void {
    // this.currentEdges.forEach(edge => _.pull(edge.match, key))
    _.pull(this.currentEdge.match, key);
    this.vmodel.events.emit(Events.updatemodel);
  }

  addVariableToEdge(event: any) {
    // console.log('EVENT ',event.target.value)
    // this.currentEdges.forEach(edge => edge.variable = event.target.value)

  }
}
