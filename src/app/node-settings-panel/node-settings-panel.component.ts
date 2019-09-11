import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {ModelService} from '../services/model.service';
import {EventService} from '../services/event.service';
import {ViewNode} from '../view-model-nodes/viewNode';
import {FormControl} from '@angular/forms';
import { HttpService } from '../services/http.service';
import { GrammarService } from '../services/grammar.service';
import { Strings } from '../graph/nodeProps/optionStrings';
import { MatSnackBar } from '@angular/material';
import { NodeType } from '../graph/nodes/nodes';

@Component({
  selector: 'app-node-settings-panel',
  templateUrl: './node-settings-panel.component.html',
  styleUrls: ['./node-settings-panel.component.scss']
})
export class NodeSettingsPanelComponent implements OnInit {
  @ViewChild("file", {static: false}) file: ElementRef
  isProgress = false
  currentNode: ViewNode
  model;
  myControl = new FormControl()
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER];

  panelOpenState = false;

  constructor(private _modelService: ModelService,
              private _eventService: EventService,
              private _http: HttpService,
              private _grammarService: GrammarService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.setDataSource({node: 'root'})
    this._eventService._events.addListener('showProps', (data) => {
      this.setDataSource(data)
    });
    this.model = this._modelService.model;
  }

  setDataSource(data: any) {
    this.currentNode = this._modelService.viewModel.get(data.node)
    console.log(this.currentNode)
  }

  changeGrammar(selected: string, index: number) {
    switch(selected) {
      case Strings.LOAD_GRAMMAR: {
        this.file.nativeElement.click();
        break
      }
      case Strings.FILE_GRAMMAR: {
        this.currentNode.props.forEach(prop => {
          if (prop.name === Strings.GRAMMAR) {
            prop.value.disabled = false
          }
        })
        break
      }
      case Strings.BUILTIN_GRAMMAR: {
        this.currentNode.props.forEach(prop => {
          if (prop.name === Strings.GRAMMAR) {
            prop.value.disabled = true
          }
        })
        break
      }
    }
  }

  uploadFile(event: any) {
    this.isProgress = true
    this._http.sendGrammarFile(event.target.files[0]).subscribe((response) => {
      this._grammarService.grammars.push(event.target.files[0].name)
      this.currentNode.props.forEach(item => {
        if (item.name === Strings.GRAMMAR) {
          item.value.value.push(event.target.files[0].name)
          item.value.selected = event.target.files[0].name;
        }
        this.isProgress = false
      })
    }, error => {
      this.showMessage('Загрузка не удалась', 'Закрыть')
      this.isProgress = false
      console.log(error);
    });
  }

  showMessage(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  onHover(id: string, focus:boolean) {
    this._eventService._events.emit('onHover', {id,focus})
  }

  add(event: MatChipInputEvent, id: string): void {
    const input = event.input;
    const value = event.value;
    switch(this.currentNode.type) {
      case NodeType.BranchNode: {
        if ((value || '').trim()) {
          this.currentNode.edgeList.forEach(edge => {
            if (edge.id === id) {
              edge.match.push(value.trim())
              this._eventService._events.emit('updateCell', this.currentNode.id)
            }
          });
        }
        break
      }
      case NodeType.SpecifierNode: {
        if ((value || '').trim()) {
          this.currentNode.props.forEach(prop => {
            if (prop.name === 'Ключевые слова') {
              prop.value.push(value.trim())
              this._eventService._events.emit('updateCell', this.currentNode.id)
            }
          });
        }
        break
      }
    }
    if (input) {
      input.value = '';
    }
  }

  remove(key: string, id: string): void {
    let index: number
    switch(this.currentNode.type) {
      case NodeType.BranchNode: {
        this.currentNode.edgeList.forEach(edge => {
          if (edge.id === id) {
            index = edge.match.indexOf(key);
          }
          if (index >= 0) {
            edge.match.splice(index, 1);
          }
        })
        break
      }
      case NodeType.SpecifierNode: {
        this.currentNode.props.forEach(prop => {
          if(prop.name === Strings.KEYWORDS) {
            index = prop.value.indexOf(key);
          }
          if (index >= 0) {
            prop.value.splice(index, 1);
          }
        })
        break
      }
    }


  }
}
