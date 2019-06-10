import { Component, OnInit } from '@angular/core';
import { ModelService } from '../../services/model.service';
import { NodeType } from 'src/app/nodes/nodes';
import { TreeComponent } from '../tree.component';

@Component({
  selector: 'app-add-tree',
  templateUrl: './add-tree.component.html',
  styleUrls: ['./add-tree.component.scss']
})
export class AddTreeComponent implements OnInit {

  items = ["root", "classify", "buy_ext_estate", "buy_validate", "other"]

  nodes: string[] = [];
  types: string[] = [];
  model: any;

  constructor(private _modelService: ModelService,
              private _treeComp: TreeComponent) { 
    this.model = _modelService.model;
  }

  ngOnInit() {
    Object.keys(NodeType).map((element) => {
      this.types.push(NodeType[element]);
    });
    Object.keys(this.model).map((element, index, arr) => {
      this.nodes.push(this.model[element].id);
    });
    // console.log(this.types);
  }

  showMessage(parent: string, type: NodeType) {
    this._treeComp.addNode(parent, type);
  }
}
