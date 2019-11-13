import {Component, OnInit} from '@angular/core';
import {ModelService} from '../../services/model.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private model: ModelService) {
  }

  ngOnInit() {
  }

  showLK() {
    let user = prompt('Hello User', 'DemoUser');
    this.model.user = user;
  }

}
