import { NodeType } from './../graph/nodes/nodes';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { ModelService } from '../services/model.service';
import { EventService } from '../services/event.service';
import { Node } from '../graph/nodes/nodes';
import { ViewNode } from '../view-model-nodes/viewNode';
import * as uuid from 'uuid'
declare var mxClient: any;
// mxClient.mxBasePath = 'assets/mxgraph'
declare var mxCompactTreeLayout: any;
declare var mxCellMarker: any;
declare var mxCellHighlight: any;
declare var mxConstants: any;
declare var mxUtils: any;
declare var mxEvent: any;
declare var mxGraph: any;
declare var mxBasePath: any;
declare var mxImageBasePath: any;
declare var mxCell: any;

// declare var require: any;
// const mx = require('mxgraph')
// // ({
// //   mxImageBasePath: 'assets/mxgraph/images',
// //   mxBasePath: 'assets/mxgraph'
// // });

@Component({
  selector: 'app-mx-graph',
  templateUrl: './mx-graph.component.html',
  styleUrls: ['./mx-graph.component.scss']
})

export class MxGraphComponent implements OnInit, AfterViewInit {

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
  }

  ngAfterViewInit() {
    console.log('mxBasePath is: ' + mxBasePath)
    console.log('mxImageBasePath is: ' + mxImageBasePath)
  }

  ngOnInit() {
    this.initializeMxGraph();
    this.initStyles();
    this.layout = new mxCompactTreeLayout(this.graph);
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
    this._eventService._events.addListener('updateGraph', (id) => {
      const node = this._modelService.viewModel.get(id)
      this.graph.model.setValue(this.map.get(id), node.options[0].value)

    })
    this._eventService._events.addListener('highlight', (id) => {
      let name = this.map.get(id)
      this.highlightCellOn(name);
    })
    // Подписаться на получение Node для подстветки =>
    // this.highlightCellOn(NodeName); //подсветка
    // this.highlightCellReset();  //сброс
  }

  initListeners() {
    this.graph.setTooltips(true);

    var marker = new mxCellMarker(this.graph);         // ПОДСВЕТКА ПО МЫШКЕ
    this.graph.addMouseListener({
      mouseDown: ((sender, me) => {
        if (me.evt.button === 0) //left
        {
          if (me.getCell() !== null) {
            // this.emitNameCell.emit(me.getCell().value);
            if (me.getCell().parent.value === undefined) {
              // this._eventService._events.emit('selectNode', {node: me.getCell().value, type: me.getCell().value});
              this._eventService._events.emit('showProps', {node: me.getCell().id, type: 'options'});
              console.log('Select node', me.getCell().value);
            } else {
              this._eventService._events.emit('showProps', {node: me.getCell().id, type: 'options'});
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

    this.highlight = new mxCellHighlight(this.graph, '#ff0000', 5);

  }

  initStyles() {
    let actNodeStyle = {};
    actNodeStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    // actNodeStyle[mxConstants.STYLE_OPACITY] = 50;
    actNodeStyle[mxConstants.STYLE_FONTCOLOR] = '#FFFFFF';
    actNodeStyle[mxConstants.STYLE_FONTFAMILY] = 'Roboto';
    actNodeStyle[mxConstants.STYLE_FONTSIZE] = 13;
    actNodeStyle[mxConstants.STYLE_ROUNDED] = 0;
    actNodeStyle[mxConstants.STYLE_ARCSIZE] = 10;
    actNodeStyle[mxConstants.STYLE_STROKECOLOR] = '#757575';
    actNodeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
    actNodeStyle[mxConstants.STYLE_FILLCOLOR] = '#C2C923';
    // actNodeStyle[mxConstants.STYLE_FILLCOLOR] = '#09af00';
    actNodeStyle[mxConstants.STYLE_OVERFLOW] = 'hidden';
    actNodeStyle[mxConstants.STYLE_ALIGN] = 'center';
    // actNodeStyle[mxConstants.WORD_WRAP] = 'break-word';
    actNodeStyle[mxConstants.STYLE_WHITE_SPACE] = 'wrap';
    this.graph.getStylesheet().putCellStyle('ActionNode', actNodeStyle);

    let classNodeStyle = {};
    classNodeStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
    // classNodeStyle[mxConstants.STYLE_OPACITY] = 50;
    classNodeStyle[mxConstants.STYLE_FONTCOLOR] = '#FFFFFF';
    classNodeStyle[mxConstants.STYLE_FONTFAMILY] = 'Roboto';
    classNodeStyle[mxConstants.STYLE_FONTSIZE] = 13;
    classNodeStyle[mxConstants.STYLE_ROUNDED] = 0;
    classNodeStyle[mxConstants.STYLE_ARCSIZE] = 10;
    // classNodeStyle[mxConstants.STYLE_STROKECOLOR] = '#757575';
    classNodeStyle[mxConstants.STYLE_STROKECOLOR] = '#FCB414';
    classNodeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
    classNodeStyle[mxConstants.STYLE_FILLCOLOR] = '#ee6002';
    classNodeStyle[mxConstants.STYLE_OVERFLOW] = 'hidden';
    classNodeStyle[mxConstants.STYLE_ALIGN] = 'center';
    classNodeStyle[mxConstants.STYLE_WHITE_SPACE] = 'wrap';
    classNodeStyle[mxConstants.STYLE_SPACING] = '10px';
    this.graph.getStylesheet().putCellStyle('ClassifierNode', classNodeStyle);

    let specNodeStyle = {};
    specNodeStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_HEXAGON;
    // specNodeStyle[mxConstants.STYLE_OPACITY] = 50;
    specNodeStyle[mxConstants.STYLE_FONTCOLOR] = '#FFFFFF';
    specNodeStyle[mxConstants.STYLE_FONTFAMILY] = 'Roboto';
    specNodeStyle[mxConstants.STYLE_FONTSIZE] = 13;
    specNodeStyle[mxConstants.STYLE_STROKECOLOR] = '#757575';
    specNodeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
    // specNodeStyle[mxConstants.STYLE_FILLCOLOR] = '#2196F3';
    specNodeStyle[mxConstants.STYLE_FILLCOLOR] = '#16A5C7';
    specNodeStyle[mxConstants.STYLE_OVERFLOW] = 'hidden';
    specNodeStyle[mxConstants.STYLE_ALIGN] = 'center';
    specNodeStyle[mxConstants.STYLE_WHITE_SPACE] = 'wrap';
    specNodeStyle[mxConstants.STYLE_SPACING] = '10px';
    this.graph.getStylesheet().putCellStyle('SpecifierNode', specNodeStyle);

    let endNodeStyle = {};
    endNodeStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
    // endNodeStyle[mxConstants.STYLE_OPACITY] = 50;
    endNodeStyle[mxConstants.STYLE_FONTCOLOR] = '#ffffff';
    endNodeStyle[mxConstants.STYLE_FONTFAMILY] = 'Roboto';
    endNodeStyle[mxConstants.STYLE_FONTSIZE] = 13;
    endNodeStyle[mxConstants.STYLE_STROKECOLOR] = '#757575';
    endNodeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
    // endNodeStyle[mxConstants.STYLE_FILLCOLOR] = '#FF4081';
    endNodeStyle[mxConstants.STYLE_FILLCOLOR] = '#F04E63';
    endNodeStyle[mxConstants.STYLE_OVERFLOW] = 'hidden';
    endNodeStyle[mxConstants.STYLE_ALIGN] = 'center';
    endNodeStyle[mxConstants.STYLE_WHITE_SPACE] = 'wrap';
    this.graph.getStylesheet().putCellStyle('EndNode', endNodeStyle);

    let edgeStyle = {};
    edgeStyle[mxConstants.STYLE_STROKECOLOR] = '#757575';
    edgeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
    this.graph.getStylesheet().putCellStyle('Edge', edgeStyle);

    //this.styleCell = 'text;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rotatable=0';
    //this.styleVertex = 'ROUNDED;separatorColor=green;rounded=1;arcSize=10';
  }

  private initializeMxGraph() {
    const container = document.getElementById('graphContainer');

    if (!mxClient.isBrowserSupported()) {
      mxUtils.error('Browser is not supported!', 200, false);
    } else {
      mxEvent.disableContextMenu(container);


      this.graph = new mxGraph(container);
      // const mxRubberband1 = new mx.mxRubberband(this.graph);
      this.parent = this.graph.getDefaultParent();
      this.graph.graphHandler.setRemoveCellsFromParent(false);
      this.graph.resetEdgesOnMove = true;
      this.graph.graphHandler.setSelectEnabled(false);
      this.graph.enterStopsCellEditing = true
      this.graph.setHtmlLabels(true);

      // this.graph.setCellsMovable(false);
      // this.graph.setAutoSizeCells(true);
      this.graph.setPanning(true);
      this.graph.centerZoom = false;
      this.graph.panningHandler.useLeftButtonForPanning = true;

      const thiz = this;
      mxEvent.addMouseWheelListener(function (evt, up) {
        // mx.Print = false;
        if (evt.altKey && up) {
          thiz.graph.zoomIn();
            mxEvent.consume(evt);
        } else if (evt.altKey) {
          thiz.graph.zoomOut();
            mxEvent.consume(evt);
        }
      });
      // this.graph.addListener(mxEvent.LABEL_CHANGED,  function (sender, evt) {
      //   const id = evt.properties.cell.value;
      //   const parent = evt.properties.cell.edges[0].source.value
      //   thiz.map.set(id, evt.properties.cell);
      //   let viewNode = thiz._modelService.viewModel.get(id)
      //   if ( viewNode !== undefined) {
      //     viewNode.id = id
      //   } else {
      //     thiz._modelService.addNewViewNode(id, evt.properties.cell.style, parent)
      //   }
      //   thiz._eventService._events.emit("nodeChanged");
      // });

      this.graph.popupMenuHandler.factoryMethod = function(menu, cell, evt)
				{
          if (thiz.canAddNewNode(cell)) {
            menu.addItem('Создать ActionNode', 'assets/images/call.png', function()
              {
                const id = uuid.v4()
                thiz.addNewNode(id, NodeType.ActionNode, cell.id)
                thiz._modelService.addNewViewNode(id, NodeType.ActionNode, cell.id)
              });
            menu.addItem('Создать ClassifierNode', 'assets/images/split.png', function()
              {
                const id = uuid.v4()
                thiz.addNewNode(id, NodeType.ClassifierNode, cell.id)
                thiz._modelService.addNewViewNode(id, NodeType.ClassifierNode, cell.id)
              });
            menu.addItem('Создать SpecifierNode', 'assets/images/record.png', function()
              {
                const id = uuid.v4()
                thiz.addNewNode(id, NodeType.SpecifierNode, cell.id)
                thiz._modelService.addNewViewNode(id, NodeType.SpecifierNode, cell.id)
              });
            menu.addItem('Создать EndNode', 'assets/images/done.png', function()
              {
                const id = uuid.v4()
                thiz.addNewNode(id, NodeType.EndNode, cell.id)
                thiz._modelService.addNewViewNode(id, NodeType.EndNode, cell.id)
              });
            }
          menu.addItem('Удалить', 'assets/images/delete.png', function()
            {
              thiz.deleteNode(cell.id)
            });
				};
      }
    }
    canAddNewNode(cell: any) {
      const viewNode = this._modelService.viewModel.get(cell.id)
      switch(viewNode.type) {
        case NodeType.ActionNode: {
          console.log(viewNode.edgeList);
          if(viewNode.edgeList === undefined || viewNode.edgeList.length === 0) {
            return true
          } else {
            return false
          }
        }
        case NodeType.ClassifierNode: {
          return true
        }
        case NodeType.EndNode: {
          return false
        }
        case NodeType.SpecifierNode: {
          if(viewNode.edgeList === undefined || viewNode.edgeList.length === 0) {
            return true
          } else {
            return false
          }
        }
      }
    }
  private buildModel() {
    const mapNode = new Map();
    this.graph.getModel().beginUpdate();
    try {
      this.viewModel.forEach((node: ViewNode) => {

        let vObj = this.graph.insertVertex(this.parent, node.id, node.options[0].value, 0, 0, 120, 80, node.type);
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
    this.highlight.highlight(this.graph.view.getState(cell));
  }
  highlightCellReset() {
    this.highlight.resetHandler();
  }

  public addNode(id: string) {
    const viewNode = this._modelService.viewModel.get(id)
    this.graph.getModel().beginUpdate();
    try {
      let vObj = this.graph.insertVertex(this.parent, viewNode.id, 'Ну вот он текст', 0, 0, 120, 80, viewNode.type);
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
      vObj = this.graph.insertVertex(this.parent, id, 'Ну вот он текст, ебать', 0, 0, 120, 80, type);
      this.map.set(id, vObj);
      // this.graph.insertEdge(this.parent, null, '', this.map.get(parent), vObj, 'Edge');
      this.graph.insertEdge(this.parent, null, 'test', this.map.get(parent), vObj, 'verticalLabelPosition=top;verticalAlign=bottom');
    } finally {
      this.layout.execute(this.parent);
      this.graph.getModel().endUpdate();
      // let element = this.graph.view.getState(vObj).shape.node
      // var clickEvent  = document.createEvent ('MouseEvents');
      // clickEvent.initEvent('dblclick', true, true);
      // element.dispatchEvent(clickEvent);
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
  //   style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
  //   style[mxConstants.STYLE_OPACITY] = 50;
  //   style[mxConstants.STYLE_FONTCOLOR] = '#774400';
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
