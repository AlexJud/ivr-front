import { NodeType } from './../graph/nodes/nodes';
import { BuildTreeService } from './../services/build.tree.service';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModelService } from '../services/model.service';
import { mxgraph } from 'mxgraph';
import { collectExternalReferences } from '@angular/compiler';
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

    // console.log(`this model ${this.model}`);
  }

  ngOnInit() {
    this._eventService._events.addListener("modelReceived", () => {
      this.model = this._modelService.model;
      this.buildModel();
    })

    this.initializeMxGraph();
    this.initStyles();
    this.layout = new mx.mxCompactTreeLayout(this.graph);
    this.initListeners();
    this._eventService._events.addListener('addNode', (data) => {
      this.addNode(data.node, data.parent);
    });
    this._eventService._events.addListener('deleteNode', (id: string) => {
      this.deleteNode(id)
    });

    // Подписаться на получение Node для подстветки =>
    // this.highlightCellOn(NodeName); подсветка
    // this.highlightCellReset();  сброс

  }

  initListeners() {
    // this.graph.setTooltips(true);

    // var marker = new mx.mxCellMarker(this.graph);         // ПОДСВЕТКА ПО МЫШКЕ
    // this.graph.addMouseListener({
    //   mouseDown: ((sender, me) => {
    //     if (me.evt.button === 1) //left
    //     {
    //       if (me.getCell() !== null) {
    //         // this.emitNameCell.emit(me.getCell().value);
    //         if (me.getCell().parent.value === undefined) {
    //           this._eventService.send('selectNode', me.getCell().children[0].value);
    //         } else {
    //           this._eventService.send('selectNode', me.getCell().value);
    //         }
    //       }
    //     }
    //   }),
    //   mouseMove: function (sender, me) {
    //     //     marker.process(me);
    //   },
    //   mouseUp: function () {
    //   }
    // });

    // this.highlight = new mx.mxCellHighlight(this.graph, '#ff0000', 2);

  }

  initStyles() {                                          // СТИЛИ КОМПОНЕНТОВ

    //ACT NODE
    let actNodeStyle = {};
    actNodeStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_RECTANGLE;
    actNodeStyle[mx.mxConstants.STYLE_OPACITY] = 50;
    actNodeStyle[mx.mxConstants.STYLE_FONTCOLOR] = '#774400';
    actNodeStyle[mx.mxConstants.STYLE_ROUNDED] = 1;
    actNodeStyle[mx.mxConstants.STYLE_ARCSIZE] = 10;
    this.graph.getStylesheet().putCellStyle('ActionNode', actNodeStyle);

    let classNodeStyle = {};
    classNodeStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_RHOMBUS;
    classNodeStyle[mx.mxConstants.STYLE_OPACITY] = 50;
    classNodeStyle[mx.mxConstants.STYLE_FONTCOLOR] = '#774400';
    this.graph.getStylesheet().putCellStyle('ClassifierNode', classNodeStyle);

    let specNodeStyle = {};
    specNodeStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_HEXAGON;
    specNodeStyle[mx.mxConstants.STYLE_OPACITY] = 50;
    specNodeStyle[mx.mxConstants.STYLE_FONTCOLOR] = '#774400';
    this.graph.getStylesheet().putCellStyle('SpecifierNode', specNodeStyle);

    let endNodeStyle = {};
    endNodeStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_ELLIPSE;
    endNodeStyle[mx.mxConstants.STYLE_OPACITY] = 50;
    endNodeStyle[mx.mxConstants.STYLE_FONTCOLOR] = '#ffffff';
    endNodeStyle[mx.mxConstants.STYLE_FILLCOLOR] = '#ff0000';
    this.graph.getStylesheet().putCellStyle('EndNode', endNodeStyle);

    //this.styleCell = 'text;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rotatable=0';
    //this.styleVertex = 'ROUNDED;separatorColor=green;rounded=1;arcSize=10';
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
      this.graph.resetEdgesOnMove = true;
      this.graph.graphHandler.setSelectEnabled(false);

      const thiz = this;

      this.graph.addListener(mx.mxEvent.LABEL_CHANGED,  function (sender, evt) {
        const id = evt.properties.cell.value;
        thiz._modelService.getNode("<new>").id = id;
        thiz._eventService._events.emit("nodeChanged");
      });

      this.graph.popupMenuHandler.factoryMethod = function(menu, cell,evt)
				{
					menu.addItem('Создать ActionNode', null, function()
				    {
              thiz._modelService.addNodeToViewModel("<new>", NodeType.ActionNode, cell.value);
				    });

					menu.addItem('Создать ClassifierNode', null, function()
				    {
              thiz._modelService.addNodeToViewModel("<new>", NodeType.ClassifierNode, cell.value);
				    });
            menu.addItem('Создать SpecifierNode', null, function()
				    {
              thiz._modelService.addNodeToViewModel("<new>", NodeType.SpecifierNode, cell.value);
            });
            menu.addItem('Создать EndNode', null, function()
				    {
              thiz._modelService.addNodeToViewModel("<new>", NodeType.EndNode, cell.value);
				    });

				};
    }
  }

  private buildModel() {                                  // ОТРИСОВКА МОДЕЛЕЙ
    const mapNode = new Map();


    this.graph.getModel().beginUpdate();

    try {
      this.model.forEach((node) => {

        let vObj = this.graph.insertVertex(this.parent, null, node.id, 0, 0, 120, 80, node.constructor.name);
       // let vCell = this.graph.insertVertex(vObj, null, node.id, 0, 20, 120, 40, this.styleCell);
        this.map.set(node.id, vObj);
        mapNode.set(node.id, node);
      });

      this.map.forEach((v, k) => {
        if (mapNode.get(k).edgeList.length !== 0) {
          mapNode.get(k).edgeList.forEach((nodeName) => {
            console.log(nodeName);
            let p = this.graph.insertEdge(this.parent, null, '', this.map.get(k), this.map.get(nodeName.id));
          });
        }
      });
    } catch (e) {
      console.error(`Erorr: ${e}`);
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
    this.graph.getModel().beginUpdate();
    try {
      let vObj = this.graph.insertVertex(this.parent, null, node.id, 0, 0, 120, 80, node.constructor.name);
      //let vCell = this.graph.insertVertex(vObj, null, node.id, 0, 20, 120, 40, this.styleCell);
      this.map.set(node.id, vObj);
      this.graph.insertEdge(this.parent, null, '', this.map.get(parent), vObj);
    } finally {
      this.layout.execute(this.parent);
      this.graph.getModel().endUpdate();
    }
  }

  public deleteNode(id: string) {
    this.graph.getModel().beginUpdate();
    try {
      const rNode = this.map.get(id);
      this.graph.removeCells([rNode]);
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
