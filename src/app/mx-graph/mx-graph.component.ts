import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ModelService} from '../services/model.service';
import {mxgraph} from 'mxgraph';
import {collectExternalReferences} from '@angular/compiler';
import { EventService } from '../services/event.service';
import { Node, ActionNode } from '../graph/nodes/nodes';
import { Relation } from '../graph/nodes/relation';

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

  @Output('getNameCellByClick') emitNameCell = new EventEmitter();

  model;
  graph: any;
  parent: any;
  styleSheet = {};
  styleCell = '';
  styleVertex = '';
  mxGraphHandler;
  highlight;
  layout;
  map = new Map();
  node: Node;
  constructor(private _modelService: ModelService,
              private _eventService: EventService) {
    this.model = _modelService.model;
    // console.log(`this model ${this.model}`);
  }

  ngOnInit() {
    this.initStyles();
    this.initializeMxGraph();
    this.layout = new mx.mxCompactTreeLayout(this.graph);
    this.buildModel();
    this.initListeners();
    this._eventService.on('addNode', (data) => {
      this.addNode(data.node, data.parent);
    });

    // Подписаться на получение Node для подстветки =>
    // this.highlightCellOn(NodeName); подсветка
    // this.highlightCellReset();  сброс

  }

  initListeners() {
    this.graph.setTooltips(true);

    var marker = new mx.mxCellMarker(this.graph);         // ПОДСВЕТКА ПО МЫШКЕ
    this.graph.addMouseListener({
      mouseDown: ((sender, me) => {
        if (me.getCell() !== null) {
          // this.emitNameCell.emit(me.getCell().value);
          if(me.getCell().parent.value === undefined) {
            this._eventService.send('selectNode', me.getCell().children[0].value);
          } else {
            this._eventService.send('selectNode', me.getCell().value);
          }
        }
      }),
      mouseMove: function(sender, me) {
        marker.process(me);
      },
      mouseUp: function() {
      }
    });

    this.highlight = new mx.mxCellHighlight(this.graph, '#ff0000', 2);

  }

  initStyles() {                                          // СТИЛИ КОМПОНЕНТОВ
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
      this.graph.graphHandler.setRemoveCellsFromParent(false);
      this.graph.graphHandler.setSelectEnabled(false);
    }
  }

  private buildModel() {                                  // ОТРИСОВКА МОДЕЛЕЙ
    const mapNode = new Map();

    this.graph.getStylesheet().putCellStyle('ROUNDED', this.styleSheet);
    this.graph.getModel().beginUpdate();

    try {
      this.model.forEach((node) => {
        let vObj = this.graph.insertVertex(this.parent, null, node.constructor.name, 0, 0, 120, 80, this.styleVertex);
        let vCell = this.graph.insertVertex(vObj, null, node.id, 0, 20, 120, 40, this.styleCell);
        this.map.set(node.id, vObj);
        mapNode.set(node.id, node);
      });

      this.map.forEach((v, k) => {
        if (mapNode.get(k).children.length !== 0) {
          mapNode.get(k).children.forEach((nodeName) => {
            console.log(nodeName);
            let p = this.graph.insertEdge(this.parent, null, '', this.map.get(k), this.map.get(nodeName.id));
          });
        }
      });
    } catch (e) {
      console.log(`Erorr: ${e}`);
    } finally {
      this.layout.execute(this.parent);
      this.graph.getModel().endUpdate();
      // this.graph.setCellsLocked(true);
    }
  }
                                                    // ПОДСВЕТКА ЯЧЕКИ
  highlightCellOn(cell) {
      this.highlight.highlight(this.graph.view.getState(this.map.get(cell)));
  }
  highlightCellReset() {
    this.highlight.resetHandler();
  }
  
  public addNode(node?: Node, parent?: string) {
    // console.log('PARENT IS: ',parent);
    console.log('PARENT',this.map.get(parent));
    this.graph.getModel().beginUpdate();
    try {
      let vObj = this.graph.insertVertex(this.parent, null, node.constructor.name, 0, 0, 120, 80, this.styleVertex);
      let vCell = this.graph.insertVertex(vObj, null, node.id, 0, 20, 120, 40, this.styleCell);
      this.map.set(node.id, vObj);
      this.graph.insertEdge(this.parent, null, '', this.map.get(parent), vObj);
   } finally {
      this.layout.execute(this.parent);
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
