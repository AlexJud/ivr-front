import {NodeType} from './../graph/nodes/nodes';
import {AfterViewInit, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ModelService} from '../services/model.service';
import {EventService} from '../services/event.service';
import {Node} from '../graph/nodes/nodes';
import {ViewNode} from '../view-model-nodes/viewNode';
// import {mxResources, mxVertexHandler} from "mxgraph";

declare var mxClient: any;
// mxClient.mxBasePath = 'assets/mxgraph'
declare var mxCompactTreeLayout: any;
declare var mxHierarchicalLayout: any;
declare var mxFastOrganicLayout: any;
declare var mxCellMarker: any;
declare var mxCellHighlight: any;
declare var mxConstants: any;
declare var mxUtils: any;
declare var mxEvent: any;
declare var mxGraph: any;
declare var mxBasePath: any;
declare var mxImageBasePath: any;
declare var mxCell: any;
declare var mxVertexHandler: any;
declare var mxResources: any;
declare var mxCellOverlay: any;
declare var mxImage: any;
declare var mxPoint: any;
declare var mxEdgeHandler: any;
declare var mxMorphing: any;
declare var mxCellTracker: any;

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

export class MxGraphComponent implements OnInit {

  @Output('getNameCellByClick') emitNameCell = new EventEmitter();

  viewModel;
  graph: any;
  parent: any;
  styleSheet = {};
  mxGraphHandler;
  highlight;
  layout;
  layout2;
  layout3;
  map = new Map();
  node: Node;

  private counterNodeId = 0;

  constructor(private _modelService: ModelService,
              private _eventService: EventService) {
  }

  ngOnInit() {
    this.initializeMxGraph();
    this.initStyles();
    this.layout = new mxCompactTreeLayout(this.graph);
    this.layout2 = new mxHierarchicalLayout(this.graph, mxConstants.DIRECTION_WEST);
    this.layout3 = new mxFastOrganicLayout(this.graph)
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
      this.layout2 = new mxHierarchicalLayout(this.graph, mxConstants.DIRECTION_WEST);
      this.buildModel()
      console.log(this.graph);
    })
    this._eventService._events.addListener('updateGraph', (id) => {
      const node = this._modelService.viewModel.get(id)
      this.graph.model.setValue(this.map.get(id), node.props[0].value)

    })
    this._eventService._events.addListener('highlight', (id) => {
      // this._eventService._events.addListener('onHover', (id) => {
      let name = this.map.get(id)
      this.highlightCellOn(name);
    })
    this._eventService._events.addListener('changeLayout', (name) => this.changeLayout(name))
    this._eventService._events.addListener('updateCell', (id) => this.renderNodeFromViewModel(id))
    this._eventService._events.addListener('onHover', (obj) => this.high(obj))

    new mxCellTracker(this.graph, '#de7f1c'); // hover cell подсветка

    this.graph.setCellsResizable(false);
  }

  initListeners() {
    this.graph.setTooltips(true);

    // this.marker = new mxCellMarker(this.graph);         // ПОДСВЕТКА ПО МЫШКЕ

    this.graph.addListener(mxEvent.CLICK, mxUtils.bind(this, function (sender, evt) {
      if (evt.properties['cell'] && evt.properties['cell'].vertex) {
        this._eventService._events.emit('showProps', {node: evt.properties['cell'].id, type: 'options'});
      }
    }));

    this.highlight = new mxCellHighlight(this.graph, '#ff0000', 5);


  }

  high({id, focus}) {
    if (focus) {
      this.highlightCellOn(this.map.get(id))
    } else {
      this.highlightCellReset()
    }
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

      // this.graph.setConnectable(true);
      // this.graph.cellLabelChanged = function (cell, value, autoSize) {
      //   this.graph.setValue(cell,value)
      //   console.log('LABEL CHANGED ',cell)
      //   console.log('LABEL CHANGED 2',value)
      // }
      this.graph.addListener(mxEvent.LABEL_CHANGED, mxUtils.bind(this, function (sender, evt) {
        let idNode = evt.properties['cell'].vertex ? evt.properties['cell'].id : evt.properties['cell'].source.id
        let parent = this.viewModel.get(idNode)
        if (evt.properties['cell'].vertex) {
          parent.props[0].value = evt.properties['cell'].value
        } else {
          let edge;
          if (evt.properties['cell'].style.indexOf('greenEdge') > -1) {
            if (parent.type === NodeType.SpecifierNode) {
              edge = parent.props.find(option => option.name === 'Ключевые слова');
              edge.value = [];
              evt.properties['cell'].value.split(',').forEach(rec => edge.value.push(rec))
              return

            } else {
              edge = parent.edgeList.find(node => node.id === evt.properties['cell'].target.id)
              edge.match = []
              evt.properties['cell'].value.split(',').forEach(rec => edge.match.push(rec))
              return
            }
          } else {
            return null
            // edge = parent.edgeIfEmpty.find(node => node.id === evt.properties['cell'].target.id)
          }

          console.log('EDGE', edge)

        }
      }));
      this.graph.addListener(mxEvent.CLICK, mxUtils.bind(this, function (sender, evt) {
        // console.log('CHANGE ----------- Cell', evt.properties['cell'])

      }));

      this.graph.setCellsMovable(false);
      // this.graph.setAutoSizeCells(true);
      this.graph.setPanning(true);
      this.graph.centerZoom = false;
      this.graph.panningHandler.useLeftButtonForPanning = true;

      const thiz = this;

      // mxEvent.addMouseWheelListener(function (evt, up) {
      //   console.log('eventListener',evt.target, '  up ',up)
      //   // mx.Print = false;
      //   if (up) {
      //     thiz.graph.zoomIn();
      //     // mxEvent.consume(evt);
      //   } else {
      //     thiz.graph.zoomOut();
      //     mxEvent.consume(evt);
      //   }
      // });

      this.graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
        if (!cell) return

        let node = thiz._modelService.viewModel.get(cell.id);
        if (node.type !== NodeType.EndNode) {
          let submenu = node.type === NodeType.SpecifierNode

          if (submenu) {
            if (node.edgeList.length === 0) {
              submenu = menu.addItem('Ответ получен', null, null);
              thiz.addMenu(thiz, menu, cell, submenu)
            }
            if (node.edgeIfEmpty.length === 0) {
              submenu = menu.addItem('Eсли ошибка', null, null);
              thiz.addMenu(thiz, menu, cell, submenu, true)
            }
          } else {
            thiz.addMenu(thiz, menu, cell)
          }
        }

        menu.addItem('Удалить', 'assets/images/delete.png', function () {
          thiz.deleteNode(cell.id)
        });
      };
    }
  }

  addMenu(thiz, menu, cell, submenu = null, error: boolean = false) {
    menu.addItem('Создать BranchNode', 'assets/images/split.png', function () {
      const id = 'Branch_node_' + thiz.counterNodeId++
      thiz.addNewNode(id, NodeType.BranchNode, cell.id, error)
      thiz._modelService.addNewViewNode(id, NodeType.BranchNode, cell.id, error)
    }, submenu);
    menu.addItem('Создать SystemNode', 'assets/images/info.png', function () {
      const id = 'System_node_' + thiz.counterNodeId++
      thiz.addNewNode(id, NodeType.SystemNode, cell.id, error)
      thiz._modelService.addNewViewNode(id, NodeType.SystemNode, cell.id, error)
    }, submenu);
    menu.addItem('Создать SpecifierNode', 'assets/images/record.png', function () {
      const id = 'Specified_node_' + thiz.counterNodeId++
      thiz.addNewNode(id, NodeType.SpecifierNode, cell.id, error)
      thiz._modelService.addNewViewNode(id, NodeType.SpecifierNode, cell.id, error)
    }, submenu);
    menu.addItem('Создать EndNode', 'assets/images/done.png', function () {
      const id = 'End_node_' + thiz.counterNodeId++
      thiz.addNewNode(id, NodeType.EndNode, cell.id, error)
      thiz._modelService.addNewViewNode(id, NodeType.EndNode, cell.id, error)
    }, submenu);
  }

  addOverlay(cell: string) {
    var overlay = new mxCellOverlay(new mxImage('/assets/images/rarrow.png', 24, 24), 'Add child');
    overlay.cursor = 'hand';

    // overlay.align = mxConstants.ALIGN_CENTER;
    // overlay.verticalAlign = mxConstants.ALIGN_MIDDLE
    overlay.addListener(mxEvent.CLICK, mxUtils.bind(this, function (sender, evt) {
      this.addChild(cell);
    }));

    this.graph.addCellOverlay(cell, overlay);

  }

  addChild(cell) {
    this.graph.clearSelection();

    let model = this.graph.getModel();
    let vertex;

    model.beginUpdate();
    try {
      var geo = this.graph.getCellGeometry(cell);
      vertex = this.graph.insertVertex(this.parent, null, '', geo.x, geo.y, 120, 80)

      this.graph.view.refresh(vertex);
      let geometry = model.getGeometry(vertex);
      var edge = this.graph.insertEdge(this.parent, null, '', cell, vertex, 'greenEdge');
      this.addOverlay(vertex);

    } finally {
      model.endUpdate();
      this.layout2.execute(this.parent)
      // var morph = new mxMorphing(this.graph);

      // morph.addListener(mxEvent.DONE, mxUtils.bind(this, function()
      // {
      //   this.graph.getModel().endUpdate();
      //
      //   // if (post != null)
      //   // {
      //   //   post();
      //   // }
      // }));
      //
      // morph.startAnimation();
      // this.graph.view.refresh()
    }
    return vertex;

  }

  canAddNewNode(cell: any) {
    // const viewNode = this._modelService.viewModel.get(cell.id)
    // switch(viewNode.type) {
    //   case NodeType.BranchNode: {
    //     if(viewNode.edgeList === undefined || viewNode.edgeList.length === 0) {
    //       return true
    //     } else {
    //       return false
    //     }
    //   }
    //   case NodeType.ClassifierNode: {
    //     return true
    //   }
    //   case NodeType.EndNode: {
    //     return false
    //   }
    //   case NodeType.SpecifierNode: {
    //     if(viewNode.edgeList === undefined || viewNode.edgeList.length === 0) {
    //       return true
    //     } else {
    //       return false
    //     }
    //   }
    // }
    return true
  }

  renderNodeFromViewModel(id) {
    console.log('UPDATE ', id)
    let cell = this.graph.model.getCell(id);
    let viewNode = this.viewModel.get(id);
    this.graph.model.setValue(cell, viewNode.props[0].value)
    console.log('NODE', cell)
    viewNode.edgeList.forEach(child => {
      let edge = cell.edges.find(target => target.target.id === child.id)
      // console.l
      if (child.match) {
        this.graph.model.setValue(edge, child.match[0])
      } else {
        let value = viewNode.props.find(item => item.name === 'Ключевые слова')
        this.graph.model.setValue(edge, value.value[0])
      }
    })
    console.log('EDGE;', viewNode)
  }

  private buildModel() {
    const mapNode = new Map();
    this.map = new Map();
    // console.log('VIEW ',this.viewModel)
    this.graph.getModel().beginUpdate();
    try {
      this.viewModel.forEach((node: ViewNode) => {

        let vObj = this.graph.insertVertex(this.parent, node.id, node.props[0].value, 0, 0, 120, 80, node.type);
        // let vCell = this.graph.insertVertex(vObj, null, node.id, 0, 20, 120, 40, this.styleCell);
        // this.addOverlay(vObj)
        this.map.set(node.id, vObj);
        mapNode.set(node.id, node);
      });

      this.map.forEach((v, k) => {
        let object = mapNode.get(k);
        if (object.edgeList !== undefined && object.edgeList.length !== 0) {
          object.edgeList.forEach((nodeName) => {
            let p = this.graph.insertEdge(this.parent, null, nodeName.match ? nodeName.match[0] : '', this.map.get(k), this.map.get(nodeName.id), 'greenEdge');
          });
        }
        if (object.edgeIfEmpty && object.edgeIfEmpty.length !== 0) {
          object.edgeIfEmpty.forEach(node => {
            let edge = this.graph.insertEdge(this.parent, null, node.match ? node.match[0] : '', this.map.get(k), this.map.get(node.id), 'redEdge');
            mxEdgeHandler.prototype.isConnectableCell = function (cell) {
              console.log('CHECK IS CONNECT', cell)
              // return this.graph.connectionHandler.isConnectableCell(cell);
            };
            console.log('EDGE ', edge)

          })
        }
      });
    } catch (e) {
      console.error(`mx-graph.component Erorr: ${e}`);
    } finally {
      this.layout2.execute(this.parent);
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
      this.graph.insertEdge(this.parent, null, '', this.map.get(viewNode.parent), vObj, 'greenEdge');
    } finally {
      this.layout2.execute(this.parent);
      this.graph.getModel().endUpdate();
    }
  }

  private addNewNode(id: string, type: string, parent: string, error: boolean = false) {
    let style = error ? 'redEdge' : 'greenEdge';

    this.graph.getModel().beginUpdate();
    let vObj
    try {
      vObj = this.graph.insertVertex(this.parent, id, 'Тестовый текст', 0, 0, 120, 80, type);
      this.map.set(id, vObj);
      // this.graph.insertEdge(this.parent, null, '', this.map.get(parent), vObj, 'greenEdge');
      let edge = this.graph.insertEdge(this.parent, null, '', this.map.get(parent), vObj, style);
    } finally {
      this.layout2.execute(this.parent);
      this.graph.getModel().endUpdate();
      // let element = this.graph.view.getState(vObj).shape.node
      // var clickEvent  = document.createEvent ('MouseEvents');
      // clickEvent.initEvent('dblclick', true, true);
      // element.dispatchEvent(clickEvent);
    }
  }

  public deleteNode(id: string) {
    this._modelService.deleteViewNode(id)
    this._eventService._events.emit("updateModel");
  }

  changeLayout(name) {
    switch (name) {
      case 'tree':
        return this.layout.execute(this.parent);
      case 'organic':
        return this.layout3.execute(this.parent);
      case 'hierarch':
        return this.layout2.execute(this.parent);
    }
  }


  initStyles() {
    let branchNodeStyle = {};
    branchNodeStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    // actNodeStyle[mxConstants.STYLE_OPACITY] = 50;
    branchNodeStyle[mxConstants.STYLE_FONTCOLOR] = '#FFFFFF';
    branchNodeStyle[mxConstants.STYLE_FONTFAMILY] = 'Roboto';
    branchNodeStyle[mxConstants.STYLE_FONTSIZE] = 13;
    branchNodeStyle[mxConstants.STYLE_ROUNDED] = 0;
    branchNodeStyle[mxConstants.STYLE_ARCSIZE] = 10;
    branchNodeStyle[mxConstants.STYLE_STROKECOLOR] = '#757575';
    branchNodeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
    branchNodeStyle[mxConstants.STYLE_FILLCOLOR] = '#C2C923';
    // actNodeStyle[mxConstants.STYLE_FILLCOLOR] = '#09af00';
    branchNodeStyle[mxConstants.STYLE_OVERFLOW] = 'hidden';
    branchNodeStyle[mxConstants.STYLE_ALIGN] = 'center';
    // actNodeStyle[mxConstants.WORD_WRAP] = 'break-word';
    branchNodeStyle[mxConstants.STYLE_WHITE_SPACE] = 'wrap';
    this.graph.getStylesheet().putCellStyle('BranchNode', branchNodeStyle);

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
    edgeStyle[mxConstants.STYLE_STROKECOLOR] = '#107539';
    edgeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
    edgeStyle[mxConstants.STYLE_VERTICAL_LABEL_POSITION] = 'top'
    edgeStyle[mxConstants.STYLE_VERTICAL_ALIGN] = 'bottom'
    edgeStyle[mxConstants.STYLE_FONTSIZE] = '14'

    this.graph.getStylesheet().putCellStyle('greenEdge', edgeStyle);

    let redEdge = {
      verticalLabelPosition: 'top',
      verticalAlign: 'bottom',
      strokeWidth: 2,
      strokeColor: '#ff0500',
      fontSize: 14,
      fontColor: '#730017',

    };
    this.graph.getStylesheet().putCellStyle('redEdge', redEdge);
  }

}
