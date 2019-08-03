import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {EventService} from '../services/event.service';
import { NodeType } from '../graph/nodes/nodes';



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
  constructor(private _eventService: EventService) {
    this.nodeDescription = new Map<string, string>()
    this.nodeDescription.set(NodeType.ActionNode,
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
    console.log('NODE TYPES',this.nodeTypes);
    this.onSelectChange(this.selected)
  }

  onSelectChange(element: string) {
    console.log(element);
    switch(element) {
      case NodeType.ActionNode: {
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
}
