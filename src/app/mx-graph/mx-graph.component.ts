import { NodeType } from './../graph/nodes/nodes';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModelService } from '../services/model.service';
import { EventService } from '../services/event.service';
import { Node } from '../graph/nodes/nodes';
import { ViewNode } from '../view-model-nodes/view.model-node';


declare var require: any;
const mx = require('mxgraph123123123123')({
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

  viewModel;
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
    this.initializeMxGraph();
    this.initStyles();
    this.layout = new mx.mxCompactTreeLayout(this.graph);
    this.initListeners();
    this.viewModel = this._modelService.viewModel;
    this.buildModel();
    this._eventService._events.addListener('addNode', (id) => {
      this.addNode(id);
    });
    this._eventService._events.addListener('deleteNode', (id: string) => {
      this.deleteNode(id)
    });
    this._eventService._events.addListener('updateModel', () => {
      this.graph.removeCells(this.graph.getChildVertices(this.graph.getDefaultParent()))
      this.buildModel()
    })
    // Подписаться на получение Node для подстветки =>
    // this.highlightCellOn(NodeName); подсветка
    // this.highlightCellReset();  сброс
  }

  initListeners() {
    this.graph.setTooltips(true);

    var marker = new mx.mxCellMarker(this.graph);         // ПОДСВЕТКА ПО МЫШКЕ
    this.graph.addMouseListener({
      mouseDown: ((sender, me) => {
        if (me.evt.button === 0) //left
        {
          if (me.getCell() !== null) {
            // this.emitNameCell.emit(me.getCell().value);
            if (me.getCell().parent.value === undefined) {
              // this._eventService._events.emit('selectNode', {node: me.getCell().value, type: me.getCell().value});
              this._eventService._events.emit('showProps', {node: me.getCell().value, type: 'options'});
              console.log('Select node', me.getCell().value);
            } else {
              this._eventService._events.emit('showProps', {node: me.getCell().value, type: 'options'});
              // this._eventService._events.emit('selectNode', me.getCell().value);
              console.log('Select node', me.getCell().value);
            }
          }
        }
      }),
      mouseMove: function (sender, me) {
        //     marker.process(me);
      },
      mouseUp: function () {
      }
    });

    this.highlight = new mx.mxCellHighlight(this.graph, '#ff0000', 2);

  }

  initStyles() {
    let actNodeStyle = {};
    actNodeStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_RECTANGLE;
    // actNodeStyle[mx.mxConstants.STYLE_OPACITY] = 50;
    actNodeStyle[mx.mxConstants.STYLE_FONTCOLOR] = '#FFFFFF';
    actNodeStyle[mx.mxConstants.STYLE_FONTFAMILY] = 'Roboto';
    actNodeStyle[mx.mxConstants.STYLE_FONTSIZE] = 16;
    actNodeStyle[mx.mxConstants.STYLE_ROUNDED] = 0;
    actNodeStyle[mx.mxConstants.STYLE_ARCSIZE] = 10;
    actNodeStyle[mx.mxConstants.STYLE_STROKECOLOR] = '#757575';
    actNodeStyle[mx.mxConstants.STYLE_STROKEWIDTH] = 2;
    actNodeStyle[mx.mxConstants.STYLE_FILLCOLOR] = '#09af00';
    this.graph.getStylesheet().putCellStyle('ActionNode', actNodeStyle);

    let classNodeStyle = {};
    classNodeStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_RHOMBUS;
    // classNodeStyle[mx.mxConstants.STYLE_OPACITY] = 50;
    classNodeStyle[mx.mxConstants.STYLE_FONTCOLOR] = '#FFFFFF';
    classNodeStyle[mx.mxConstants.STYLE_FONTFAMILY] = 'Roboto';
    classNodeStyle[mx.mxConstants.STYLE_FONTSIZE] = 16;
    // classNodeStyle[mx.mxConstants.STYLE_ROUNDED] = 0;
    // classNodeStyle[mx.mxConstants.STYLE_ARCSIZE] = 10;
    classNodeStyle[mx.mxConstants.STYLE_STROKECOLOR] = '#757575';
    classNodeStyle[mx.mxConstants.STYLE_STROKEWIDTH] = 2;
    classNodeStyle[mx.mxConstants.STYLE_FILLCOLOR] = '#ee6002';
    this.graph.getStylesheet().putCellStyle('ClassifierNode', classNodeStyle);

    let specNodeStyle = {};
    specNodeStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_HEXAGON;
    // specNodeStyle[mx.mxConstants.STYLE_OPACITY] = 50;
    specNodeStyle[mx.mxConstants.STYLE_FONTCOLOR] = '#FFFFFF';
    specNodeStyle[mx.mxConstants.STYLE_FONTFAMILY] = 'Roboto';
    specNodeStyle[mx.mxConstants.STYLE_FONTSIZE] = 16;
    specNodeStyle[mx.mxConstants.STYLE_STROKECOLOR] = '#757575';
    specNodeStyle[mx.mxConstants.STYLE_STROKEWIDTH] = 2;
    specNodeStyle[mx.mxConstants.STYLE_FILLCOLOR] = '#2196F3';
    this.graph.getStylesheet().putCellStyle('SpecifierNode', specNodeStyle);

    let endNodeStyle = {};
    endNodeStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_ELLIPSE;
    // endNodeStyle[mx.mxConstants.STYLE_OPACITY] = 50;
    endNodeStyle[mx.mxConstants.STYLE_FONTCOLOR] = '#ffffff';
    endNodeStyle[mx.mxConstants.STYLE_FONTFAMILY] = 'Roboto';
    endNodeStyle[mx.mxConstants.STYLE_FONTSIZE] = 16;
    endNodeStyle[mx.mxConstants.STYLE_STROKECOLOR] = '#757575';
    endNodeStyle[mx.mxConstants.STYLE_STROKEWIDTH] = 2;
    endNodeStyle[mx.mxConstants.STYLE_FILLCOLOR] = '#FF4081';
    this.graph.getStylesheet().putCellStyle('EndNode', endNodeStyle);

    let edgeStyle = {};
    edgeStyle[mx.mxConstants.STYLE_STROKECOLOR] = '#757575';
    edgeStyle[mx.mxConstants.STYLE_STROKEWIDTH] = 2;
    this.graph.getStylesheet().putCellStyle('Edge', edgeStyle);

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
      this.graph.enterStopsCellEditing = true

      // this.graph.setCellsMovable(false);
      // this.graph.setAutoSizeCells(true);
      this.graph.setPanning(true);
      this.graph.centerZoom = false;
      this.graph.panningHandler.useLeftButtonForPanning = true;

      const thiz = this;
      mx.mxEvent.addMouseWheelListener(function (evt, up) {
        mx.Print = false;
        if (evt.altKey && up) {
          thiz.graph.zoomIn();
            mx.mxEvent.consume(evt);
        } else if (evt.altKey) {
          thiz.graph.zoomOut();
            mx.mxEvent.consume(evt);
        }
    });
      this.graph.addListener(mx.mxEvent.LABEL_CHANGED,  function (sender, evt) {
        const id = evt.properties.cell.value;
        const parent = evt.properties.cell.edges[0].source.value
        thiz.map.set(id, evt.properties.cell);
        let viewNode = thiz._modelService.viewModel.get(id)
        if ( viewNode !== undefined) {
          viewNode.id = id
        } else {
          thiz._modelService.addNewViewNode(id, evt.properties.cell.style, parent)
        }
        thiz._eventService._events.emit("nodeChanged");
      });

      this.graph.popupMenuHandler.factoryMethod = function(menu, cell, evt)
				{
					menu.addItem('Создать ActionNode', null, function()
				    {
              thiz.addNewNode('Укажите название', NodeType.ActionNode, cell.value)
				    });
					menu.addItem('Создать ClassifierNode', null, function()
				    {
              thiz.addNewNode('Укажите название', NodeType.ClassifierNode, cell.value)
              // thiz._modelService.addNewViewNode("<new>", NodeType.ClassifierNode, cell.value);
				    });
          menu.addItem('Создать SpecifierNode', null, function()
				    {
              thiz.addNewNode('Укажите название', NodeType.SpecifierNode, cell.value)
              // thiz._modelService.addNewViewNode("<new>", NodeType.SpecifierNode, cell.value);
            });
          menu.addItem('Создать EndNode', null, function()
				    {
              thiz.addNewNode('Укажите название', NodeType.EndNode, cell.value)
              // thiz._modelService.addNewViewNode("<new>", NodeType.EndNode, cell.value);
            });
          menu.addItem('Удалить', null, function()
				    {
              thiz.deleteNode(cell.value)
              // thiz._modelService.addNewViewNode("<new>", NodeType.EndNode, cell.value);
            });
            
				};
      }
    }

  private buildModel() {
    const mapNode = new Map();
    this.graph.getModel().beginUpdate();
    try {
      this.viewModel.forEach((node: ViewNode) => {

        let vObj = this.graph.insertVertex(this.parent, null, node.id, 0, 0, 120, 80, node.type);
       // let vCell = this.graph.insertVertex(vObj, null, node.id, 0, 20, 120, 40, this.styleCell);
        this.map.set(node.id, vObj);
        mapNode.set(node.id, node);
      });

      this.map.forEach((v, k) => {
        if (mapNode.get(k).edgeList !== undefined && mapNode.get(k).edgeList.length !== 0) {
          mapNode.get(k).edgeList.forEach((nodeName) => {
            let p = this.graph.insertEdge(this.parent, null, '', this.map.get(k), this.map.get(nodeName.id), 'Edge');
          });
        }
      });
    } catch (e) {
      console.error(`mx-graph.component Erorr: ${e}`);
    } finally {
      this.layout.execute(this.parent);
      this.graph.getModel().endUpdate();
    }
  }
  // ПОДСВЕТКА ЯЧЕКИ
  highlightCellOn(cell) {
    this.highlight.highlight(this.graph.view.getState(this.map.get(cell)));
  }
  highlightCellReset() {
    this.highlight.resetHandler();
  }

  public addNode(id: string) {
    const viewNode = this._modelService.viewModel.get(id)
    this.graph.getModel().beginUpdate();
    try {
      let vObj = this.graph.insertVertex(this.parent, null, viewNode.id, 0, 0, 120, 80, viewNode.type);
      //let vCell = this.graph.insertVertex(vObj, null, node.id, 0, 20, 120, 40, this.styleCell);
      this.map.set(viewNode.id, vObj);
      this.graph.insertEdge(this.parent, null, '', this.map.get(viewNode.parent), vObj, 'Edge');
    } finally {
      this.layout.execute(this.parent);
      this.graph.getModel().endUpdate();
    }
  }

  private addNewNode(id: string, type: string, parent: string) {
    this.graph.getModel().beginUpdate();
    let vObj
    try {
      vObj = this.graph.insertVertex(this.parent, null, id, 0, 0, 120, 80, type);
      this.map.set(id, vObj);
      this.graph.insertEdge(this.parent, null, '', this.map.get(parent), vObj, 'Edge');
    } finally {
      this.layout.execute(this.parent);
      this.graph.getModel().endUpdate();
      let element = this.graph.view.getState(vObj).shape.node
      var clickEvent  = document.createEvent ('MouseEvents');
      clickEvent.initEvent ('dblclick', true, true);
      element.dispatchEvent (clickEvent);
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
    this._modelService.deleteViewNode(id)
    this._eventService._events.emit("nodeChanged");
  }

  // private initModel() {
  //   const field1 = new mx.mxCell(Object.keys(this.viewModel)[0], new mx.mxGeometry(0, 40, 140, 40),
  //     'text;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rotatable=0');
  
  //   const field2 = new mx.mxCell('classify', new mx.mxGeometry(0, 40, 140, 40),
  //     'text;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rotatable=0');
  
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
  //     const v1 = this.graph.insertVertex(this.parent, null, this.viewModel['root'].constructor.name, 20, 50, 140, 80, 'ROUNDED;separatorColor=green;rounded=1;arcSize=10');
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
