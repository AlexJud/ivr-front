import {Component, OnInit, ViewChild} from '@angular/core';
import {ModelService} from '../services/model.service';
import { mxgraph } from 'mxgraph';
import {collectExternalReferences} from "@angular/compiler";

declare var require: any;
const mx = require('mxgraph')({
  mxImageBasePath: 'assets/mxgraph/images',
  mxBasePath: 'assets/mxgraph'
});

@Component({
  selector: 'app-mx-graph',
  templateUrl: './mx-graph.component.html',
  styleUrls: ['./mx-graph.component.scss']
})

export class MxGraphComponent implements OnInit {

  // @ViewChild('tree', {static: true}) tree;

  model: object;
  graph: any;
  parent: any;
  styleSheet = {};
  styleCell = '';
  styleVertex = '';



  constructor(private modelService: ModelService) {
    this.model = modelService.model;
    console.log(mx);
  }

  ngOnInit() {
    this.initStyles();
    this.initializeMxGraph();
    // this.initModel();
    this.buildModel();

  }

  initStyles() {
    this.styleSheet[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_SWIMLANE;
    this.styleSheet[mx.mxConstants.STYLE_OPACITY] = 50;
    this.styleSheet[mx.mxConstants.STYLE_FONTCOLOR] = '#774400';

    this.styleCell = 'text;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rotatable=0';

    this.styleVertex = 'ROUNDED;separatorColor=green;rounded=1;arcSize=10';
  }

  private initializeMxGraph() {
    const container = document.getElementById('graphContainer');

    if (!mx.mxClient.isBrowserSupported()) {
      mx.mxUtils.error('Browser is not supported!', 200, false);
    } else {
      mx.mxEvent.disableContextMenu(container);

      this.graph = new mx.mxGraph(container);
      // const mxRubberband1 = new mx.mxRubberband(this.graph);
      this.parent = this.graph.getDefaultParent();

    }
  }

  private buildModel() {
    const map = new Map();
    const mapV = new Map();


    Object.keys(this.model).forEach((item) => {
      const obj = this.model[item]
      var field = new mx.mxCell(item, new mx.mxGeometry(0, 40, 140, 40), this.styleCell
      );
      field.vertex = true;
      map.set(item, field);
    });

    this.graph.getModel().beginUpdate();

    this.graph.getStylesheet().putCellStyle('ROUNDED', this.styleSheet);
    try {
      let counter = -80;
      map.forEach((v, k) => {
        let vo = this.graph.insertVertex(this.parent, null, 'Node', 20, 80, 140, 80, this.styleVertex);
        vo.insert(map.get(k));
        mapV.set(k, vo);
      });

      map.forEach((v, k) => {
        if ((this.model[k].children) !== null) {
          this.model[k].children.forEach((rec) => {
            this.graph.insertEdge(this.parent, null, '', mapV.get(k), mapV.get(rec));
          });
        }
      });

    } catch (e) {
      console.log(`Erorr: ${e}`);
    } finally {
      this.graph.getModel().endUpdate();
    }
  }

  // private initModel() {
  //   const field1 = new mx.mxCell(Object.keys(this.model)[0], new mx.mxGeometry(0, 40, 140, 40),
  //     'text;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rotatable=0');
  //
  //   const field2 = new mx.mxCell('classify', new mx.mxGeometry(0, 40, 140, 40),
  //     'text;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rotatable=0');
  //
  //   field1.vertex = true;
  //   field2.vertex = true;
  //   // Adds cells to the model in a single step
  //   this.graph.getModel().beginUpdate();
  //   const style = {};
  //   style[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_SWIMLANE;
  //   style[mx.mxConstants.STYLE_OPACITY] = 50;
  //   style[mx.mxConstants.STYLE_FONTCOLOR] = '#774400';
  //   this.graph.getStylesheet().putCellStyle('ROUNDED', style);
  //   try {
  //     const v1 = this.graph.insertVertex(this.parent, null, this.model['root'].constructor.name, 20, 50, 140, 80, 'ROUNDED;separatorColor=green;rounded=1;arcSize=10');
  //     const v2 = this.graph.insertVertex(this.parent, null, 'CLASSIFIER', 300, 120, 140, 80, 'ROUNDED;separatorColor=green;rounded=1;arcSize=10');
  //     v1.insert(field1);
  //     v2.insert(field2);
  //     // var v2 = graph.insertVertex(parent, null, 'Privet', 20, 50, 80, 30, 'ROUNDED;separatorColor=green');
  //     // let node = graph.groupCells(10, v1, v2);
  //     // graph.addCell(vertexTemplateEntry);
  //     // graph.addCell(cell);
  //     // const v3 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
  //     const e1 = this.graph.insertEdge(this.parent, null, '', v1, v2);
  //   } finally {
  //     this.graph.getModel().endUpdate();
  //   }
  // }
}
