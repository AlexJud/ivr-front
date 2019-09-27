import {Component, OnInit, Output, EventEmitter, Inject} from '@angular/core';
import {EventService} from '../../services/event.service';
import { NodeType } from '../../models/types';
import {ModelService} from "../../services/model.service";
import {MatDialog} from '@angular/material/dialog'
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

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
  nodeTypes: string[] = []
  selected: string
  nodeDescription: Map<string, string>
  description: string

  animal: string;
  name: string;


  constructor(private modelService: ModelService, private dialog: MatDialog) {

    this.nodeDescription = new Map<string, string>()
    this.nodeDescription.set(NodeType.BranchNode,
      'Задаёт вопрос, распознаёт и сохраняет ответ от пользователя для дальнейшей обработки.')
    this.nodeDescription.set(NodeType.ClassifierNode,
      'Считывает распознанный ответ от пользователя и, в зависимости от совпадения ключевых слов, выбирает переход на следующий Узел.')
    this.nodeDescription.set(NodeType.SpecifierNode,
      'Производит сбор информации, последовательно задавая вопросы пользователю и записывая ответы в указанные переменные. ' +
       'Доступ к переменным осуществляется через теги @имя_переменной#.')
    this.nodeDescription.set(NodeType.EndNode, 'Озвучивает прощальное сообщение и переводит звонок на указанный номер.')
  }


  ngOnInit() {
    this.nodeTypes = Object.keys(NodeType)
    this.selected = this.nodeTypes[0]
    this.onSelectChange(this.selected)
  }

  onSelectChange(element: string) {
    switch(element) {
      case NodeType.BranchNode: {
        this.description = this.nodeDescription.get(element)
        break
      }
      case NodeType.ClassifierNode: {
        this.description = this.nodeDescription.get(element)
        break
      }
      case NodeType.SpecifierNode: {
        this.description = this.nodeDescription.get(element)
        break
      }
      case NodeType.EndNode: {
        this.description = this.nodeDescription.get(element)
        break
      }
    }
  }

  onToggleDrawer() {
    this.emitToggle.emit()
  }

  save() {
    this.modelService.saveToJson();
    // this._modelService.convertModel()
  }
  load() {
    this.modelService.requestModel()
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent);

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
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }
}



