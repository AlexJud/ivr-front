import {Component, OnInit, Output, EventEmitter, Inject, Input} from '@angular/core';
import {EventService} from '../../services/event.service';
import {NodeType} from '../../models/types';
import {ModelService} from '../../services/model.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpService} from '../../services/http.service';
import {WebSocketAPI} from '../../services/WebSocketAPI';
import {Events} from '../../models/events';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-grid-toolbar',
  templateUrl: './grid-toolbar.component.html',
  styleUrls: ['./grid-toolbar.component.scss']
})
export class GridToolbarComponent implements OnInit {

  @Output('toggleDrawer') emitToggle = new EventEmitter();
  @Input('scenarios') scenarios;

  nodeTypes: string[] = [];
  selected: string;
  nodeDescription: Map<string, string>;
  description: string;
  currentScenario: string;

  sideBarOpen: boolean = false;

  animal: string;
  name: string;


  constructor(private modelService: ModelService, private dialog: MatDialog, private webSocket: WebSocketAPI) {

    this.nodeDescription = new Map<string, string>();
    this.nodeDescription.set(NodeType.BranchNode,
      'Задаёт вопрос, распознаёт и сохраняет ответ от пользователя для дальнейшей обработки.');
    this.nodeDescription.set(NodeType.ClassifierNode,
      'Считывает распознанный ответ от пользователя и, в зависимости от совпадения ключевых слов, выбирает переход на следующий Узел.');
    this.nodeDescription.set(NodeType.SpecifierNode,
      'Производит сбор информации, последовательно задавая вопросы пользователю и записывая ответы в указанные переменные. ' +
      'Доступ к переменным осуществляется через теги @имя_переменной#.');
    this.nodeDescription.set(NodeType.EndNode, 'Озвучивает прощальное сообщение и переводит звонок на указанный номер.');
  }

  print() {
    console.log('THIS> SC', this.scenarios);
  }

  ngOnInit() {
    this.nodeTypes = Object.keys(NodeType);
    this.selected = this.nodeTypes[0];
    this.onSelectChange(this.selected);
  }

  onSelectChange(element: string) {
    switch (element) {
      case NodeType.BranchNode: {
        this.description = this.nodeDescription.get(element);
        break;
      }
      case NodeType.ClassifierNode: {
        this.description = this.nodeDescription.get(element);
        break;
      }
      case NodeType.SpecifierNode: {
        this.description = this.nodeDescription.get(element);
        break;
      }
      case NodeType.EndNode: {
        this.description = this.nodeDescription.get(element);
        break;
      }
    }
  }

  onToggleDrawer() {
    this.sideBarOpen = !this.sideBarOpen;
    if (this.sideBarOpen) {
      this.modelService.saveToJson(null, true);
      // this.webSocket.connect();
      this.modelService.graphViewModel.events.emit(Events.sidebaropened);
    } else {
      // this.webSocket.connect();
      this.modelService.graphViewModel.events.emit(Events.sidebarclosed);
    }
    this.emitToggle.emit();
  }

  save(filename) {
    this.modelService.saveToJson(filename);
    // this._modelService.convertModel()
  }

  load(filename) {
    this.modelService.requestModel(filename);
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openDialogSave() {
    const dialogRef = this.dialog.open(DialogSaveComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog result:', result);
      if (result.command === 'save') {
        this.modelService.saveToJson(result.file);
      }
      if (result.command === 'load') {
        this.modelService.requestModel(result.file);
      }
    });
  }

  openDialogOptions(){
    const dialogRef = this.dialog.open(DialogOptionsComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}


@Component({
  selector: 'dialog-component',
  templateUrl: 'modal-page.component.html',
})

export class DialogComponent {
}


@Component({
  selector: 'dialogSave-component',
  templateUrl: 'modal-page-save.component.html',
})

export class DialogSaveComponent {

  scenariosList: string[];
  selectedFile;

  constructor(private _formBuilder: FormBuilder, private http: HttpService, public dialogRef: MatDialogRef<DialogSaveComponent>) {
  }

  ngOnInit() {
    this.http.getListScenarios().subscribe(data => this.scenariosList = data);
  }

  close(option): void {
    if (option === 'save') {
      let exist = this.scenariosList.find(i => i === this.selectedFile);
      if (exist) {
        if (!confirm('такой файл существует, перезаписать?')) {
          return;
        }
      }
    }
    this.dialogRef.close({command: option, file: this.selectedFile});
  }

  select(filename) {
    this.selectedFile = filename;
  }

}

@Component({
  selector: 'dialog-component',
  templateUrl: 'modal-page-options.component.html',
})


export class DialogOptionsComponent {
  options;

  constructor(private modelService: ModelService,public dialogRef: MatDialogRef<DialogSaveComponent>) {
  }

  ngOnInit() {
    this.options = this.modelService.mrcpOptions;
    console.log('OPTIONS ',this.options)
    this.options.forEach(x => console.log('x ',x , '   ', Array.isArray(x.type)));
  }

  checkIsArray(item){
    // console.log('ITEM ',item, Array.isArray(item))
    return Array.isArray(item);
  }
  close(): void{
    this.modelService.mrcpOptions = this.options;
    this.dialogRef.close('ok');
  }
}


