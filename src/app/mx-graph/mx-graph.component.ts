import {NodeType} from '../models/types';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ModelService} from '../services/model.service';
import {
  arrayControlsImage,
  branchNodeStyle,
  classNodeStyle, edgeStyle, endNodeStyle,
  redArrow,
  specNodeStyle
} from './properties';
import { Vertex} from '../models/vertex';
import {Events} from '../models/events';
import {GraphViewModel} from "../models/graph-v-model";
import {Edge} from "../models/edge";
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
declare var mxIconSet: any;
declare var mxRectangle: any;
declare var mxCellState: any;

// declare var require: any;
// const mx = require('mxgraph')
// // ({
// //   mxImageBasePath: 'assets/mxgraph/images',
// //   mxBasePath: 'assets/mxgraph'
// // });

type Permission = { addLogicVertex: boolean, addErrorVertex: boolean, addLogicConnection: boolean, addErrorConnection: boolean }

@Component({
  selector: 'app-mx-graph',
  templateUrl: './mx-graph.component.html',
  styleUrls: ['./mx-graph.component.scss']
})

export class MxGraphComponent implements OnInit {

  @Output('getNameCellByClick') emitNameCell = new EventEmitter();

  vmodel: GraphViewModel = this.modelService.graphViewModel;

  graph: any;
  parent: any;
  styleSheet = {};
  mxGraphHandler;
  highlight;
  layout;
  tracker;
  tempImages = [];

  layouts: {
    tree: any;
    organic: any;
    hierarch: any;
  };

  constructor(private modelService: ModelService) {
  }

  ngOnInit() {
    this.initializeMxGraph();
    this.initStyles();

    this.layout = new mxHierarchicalLayout(this.graph, mxConstants.DIRECTION_WEST);
    this.highlight = new mxCellHighlight(this.graph, '#ff0000', 5);
    this.tracker = new mxCellTracker(this.graph, '#de7f1c'); // hover cell подсветка

    this.initListeners();
    this.buildGraph();
  }

  redrawGraph() {
    this.graph.removeCells(this.graph.getChildVertices(this.graph.getDefaultParent()));
    this.layout = new mxHierarchicalLayout(this.graph, mxConstants.DIRECTION_WEST);
    this.buildGraph();
  }

  initListeners() {

    this.vmodel.events.addListener(Events.loadedmodel, () => this.redrawGraph());
    this.vmodel.events.addListener(Events.updatemodel, () => this.redrawGraph());
    this.vmodel.events.addListener(Events.nodeadded, () => this.redrawGraph());
    this.vmodel.events.addListener(Events.edgeadded, () => this.redrawGraph());
    this.vmodel.events.addListener(Events.edgeremoved, () => this.redrawGraph());
    this.vmodel.events.addListener(Events.noderemoved, () => this.redrawGraph());
    this.vmodel.events.addListener(Events.cellhighlight, (obj) => this.high(obj));
    this.vmodel.events.addListener(Events.nodeactive, (data) => this.high({id: data, focus: true}));

    this.vmodel.events.addListener(Events.noderemoved, () => {
      this.graph.removeCells(this.graph.getChildVertices(this.graph.getDefaultParent()));
      this.layout = new mxHierarchicalLayout(this.graph, mxConstants.DIRECTION_WEST);
      this.buildGraph();
    });
    this.graph.setCellsResizable(false);

    this.graph.addListener(mxEvent.CLICK, mxUtils.bind(this, function (sender, evt) {
      if (evt.properties['cell']) {
        let id = evt.properties['cell'].vertex ? evt.properties['cell'].id : evt.properties['cell'].source.id;
        this.vmodel.events.emit(Events.nodeselected, {id, vertex: evt.properties['cell'].vertex});
      }
    }));

    this.graph.connectionHandler.addListener(mxEvent.CONNECT, mxUtils.bind(this, function (sender, evt) {
      // console.log('connection edge', evt);
      let error = evt.properties['cell'].style.indexOf('redEdge') > -1;
      this.modelService.bindVertex(evt.properties.cell.source.id, evt.properties.cell.target.id, error);
    }));

    this.graph.addListener(mxEvent.LABEL_CHANGED, mxUtils.bind(this, function (sender, evt) {

      if (evt.properties['cell'].vertex) {
        let node = this.vmodel.graph.get(evt.properties['cell'].id)
        let text = evt.properties['value'];
        node.speech = text;
      } else {
        let edges = this.vmodel.edges.get(evt.properties['cell'].source.id)
        let edge = edges.find(item => item.id === evt.properties['cell'].id)

        let words = [];
        evt.properties.value.split(',').forEach(elem => {
          words.push(elem.trim());
        });
        edge.match = words;
        if (edge.parent.type === NodeType.SpecifierNode) {
          edge.parent.props.result.seek = words;
        }
        // console.log('edge', edge, words)
        if (evt.properties['cell'].style.indexOf('greenEdge') > -1) {

        } else {
          if (edge.parent.type !== NodeType.SpecifierNode) {
            edge.error = false
          } else {
            edge.match = []
          }
        }
        this.vmodel.events.emit(Events.updatemodel)
      }
    }));

    this.graph.addMouseListener({

      currentState: null,
      currentIconSet: null,

      mouseDown: function (sender, me) {
        if (this.currentState != null) {
          this.dragLeave(me.getEvent(), this.currentState);
          this.currentState = null;
        }
      },
      mouseMove: function (sender, me) {
        if (this.currentState != null) {// && (me.getState() == this.currentState || me.getState() == null)) {//  //
          let offset;
          if (this.currentState.cell.vertex) {
            offset = 30;
          } else {
            offset = 5
          }
          let tmp = new mxRectangle(me.getGraphX() - offset,
            me.getGraphY() - offset * 2, 2 * offset, 2 * offset);
          if (mxUtils.intersects(tmp, this.currentState)) {
            if (thiz.tempImages.length > 0) {
              return;
            }
          }
        }
        var tmp = thiz.graph.view.getState(me.getCell());
        if (tmp != this.currentState) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState);
          }
          this.currentState = tmp;
          if (this.currentState != null) {
            this.dragEnter(me.getEvent(), this.currentState);
          }
        }
      },
      mouseUp: function (sender, me) {
      },
      dragEnter: function (evt, state) {
        if (this.currentIconSet == null) {
          this.currentIconSet = thiz.mxIconSet(state);
        }
      },
      dragLeave: function (evt, state) {
        if (!this.currentIconSet) {
          if (thiz.tempImages.length > 0) {
            thiz.tempImages.forEach(i => {
              i.parentNode.removeChild(i);
            });
          }
          this.currentIconSet = null;
        }
      }
    });

    const thiz = this;

    mxEvent.addMouseWheelListener(function (evt, up) {
      console.log('eventListener', evt, '  up ', up)
      if (up && evt.altKey) {
        thiz.graph.zoomIn();
      } else if (evt.altKey) {
        thiz.graph.zoomOut();
        mxEvent.consume(evt);
      }
    });
  }

  private buildGraph() {
    let mapCells = new Map<string, any>();

    this.graph.getModel().beginUpdate();
    try {
      this.vmodel.graph.forEach((node: Vertex) => {
        console.log('GRAPH', node)
        let vert = this.graph.insertVertex(this.parent, node.id, node.speech, 0, 0, 120, 80, node.type);
        mapCells.set(node.id, vert);
      });

      this.vmodel.edges.forEach((v: Edge[], k: string) => {
        v.forEach(edge => {
          let elem = this.graph.insertEdge(this.parent, edge.id, edge.match[0], mapCells.get(edge.parent.id), mapCells.get(edge.child.id), edge.error ? 'redEdge' : 'greenEdge');
        })
      })

    } catch (e) {
      console.error('Error build graph', e);
    } finally {
      this.layout.execute(this.parent);
      this.graph.getModel().endUpdate();
    }

  }

  high({id, focus}) {
    if (focus) {
      // this.highlightCellOn(this.graph.model.getCell(id));
      this.highlight.highlight(this.graph.view.getState(this.graph.model.getCell(id)));
    } else {
      this.highlight.resetHandler();
    }
  }

  cleanTempImages() {
    this.tempImages.forEach(i => {
      i.parentNode.removeChild(i);
    });
    this.tempImages = []
  }

  private initializeMxGraph() {
    const container = document.getElementById('graphContainer');

    if (!mxClient.isBrowserSupported()) {
      mxUtils.error('Browser is not supported!', 200, false);
    } else {
      mxEvent.disableContextMenu(container);


      this.graph = new mxGraph(container);
      // const mxRubberband1 = new mxRubberband(this.graph);
      this.parent = this.graph.getDefaultParent();
      this.graph.graphHandler.setRemoveCellsFromParent(false);
      this.graph.resetEdgesOnMove = true;
      this.graph.graphHandler.setSelectEnabled(false);
      this.graph.enterStopsCellEditing = true;
      this.graph.setHtmlLabels(true);
      this.graph.setAllowDanglingEdges(false);
      this.graph.setTooltips(true);
      this.graph.setCellsMovable(false);
      // this.graph.setCellsLocked(true);
      // this.graph.setAutoSizeCells(true);
      this.graph.setPanning(true);
      this.graph.centerZoom = false;
      this.graph.panningHandler.useLeftButtonForPanning = true;
      // this.graph.getView().updateStyle = true;
      this.graph.setConnectable(true);

      // Disables new connections via "hotspot"
      this.graph.connectionHandler.marker.isEnabled = function () {
        return this.graph.connectionHandler.first != null;
      };

      const thiz = this;

      this.graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
        if (!cell) {
          return;
        }
        if (cell.isVertex()) {
          let node = thiz.vmodel.graph.get(cell.id);
          console.log('current NODE DATA', thiz.vmodel.edges);
          // let node = thiz.modelService.viewModel.get(cell.id);
          if (node.type !== NodeType.EndNode) {
            let submenu = node.type === NodeType.SpecifierNode;

            if (submenu) {
              let edges = thiz.vmodel.edges.get(node.id);
              let ok = edges ? edges.find(edge => edge.error === false) : null;
              let err = edges ? edges.find(edge => edge.error === true) : null;

              if (!ok) {
                submenu = menu.addItem('Ответ получен', null, null);
                thiz.addMenu(thiz, menu, cell, submenu);
              }
              if (!err) {
                submenu = menu.addItem('Eсли ошибка', null, null);
                thiz.addMenu(thiz, menu, cell, submenu, true);
              }
            } else {
              thiz.addMenu(thiz, menu, cell);
            }
          }
        }
        if (!(cell.id === 'root')) {
          menu.addItem('Удалить', 'assets/images/delete.png', function () {

            let edgeId = cell.vertex ? null : cell.id;
            let id = cell.vertex ? cell.id : cell.source.id;
            thiz.modelService.deleteVertex(id, edgeId);
          });
        }
      };
    }
  }

  private addIcon(imgSrc: any, title: string, posX: any, posY: any,) {
    let img = mxUtils.createImage(imgSrc);
    img.setAttribute('title', title);
    img.style.position = 'absolute';
    img.style.cursor = 'pointer';
    img.style.width = '24px';
    img.style.height = '24px';
    img.style.left = posX + 'px';
    img.style.top = posY + 'px';

    mxEvent.addGestureListeners(img,
      mxUtils.bind(this, function (evt) {
        mxEvent.consume(evt);
      })
    );

    return img;
  }

  mxIconSet(state) {
    this.tempImages = [];
    let graph = this.graph;
    let imgArr = arrayControlsImage;
    let permit = this.getCellPermissions(null, state.cell.id, state.cell.isVertex());
    let node = this.vmodel.graph.get(state.cell.id);

    if (state.cell.style === NodeType.EndNode) {
      return;
    }

    if (permit.addLogicVertex) {
      let array = imgArr.filter(item => item.position === 'bottom');
      array.forEach(icon => {
        let posX = state.x + (icon.index * 30) + 5;
        let posY = state.y + state.height + 10;
        let img = this.addIcon(`assets/images/${icon.img}`, icon.title, posX, posY);

        mxEvent.addListener(img, 'click', mxUtils.bind(this, function (evt) {
          this.modelService.addVertex(new Vertex(null, NodeType[icon.type]), state.cell.id);
          this.cleanTempImages();
        }));

        state.view.graph.container.appendChild(img);
        this.tempImages.push(img);
      });
    }


    if (permit.addLogicConnection) {
      let icon = imgArr.find(item => item.type === 'greenEdge');

      let posX = state.x + state.width + 10;
      let posY = state.y + (icon.index * 30) + 5;
      let img = this.addIcon(`assets/images/${icon.img}`, icon.title, posX, posY);

      mxEvent.addListener(img, 'click', mxUtils.bind(this, function (evt) {
        var pt = mxUtils.convertPoint(graph.container,
          mxEvent.getClientX(evt), mxEvent.getClientY(evt));

        graph.connectionHandler.createEdgeState = function (me) {
          let edge = graph.createEdge(null, null, null, null, null, 'greenEdge');
          return new mxCellState(graph.view, edge, graph.getCellStyle(edge));
        };
        graph.connectionHandler.start(state);
        graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
        mxEvent.consume(evt);
        this.cleanTempImages()
      }));

      state.view.graph.container.appendChild(img);
      this.tempImages.push(img);
    }

    if (permit.addErrorVertex) {
      let array = imgArr.filter(item => item.position === 'bottom');
      array.forEach(icon => {
        let posX = state.x + (icon.index * 30) + 5;
        let posY = state.y + state.height + 10 + 30;
        let img = this.addIcon(`assets/images/${icon.img}`, icon.title, posX, posY);

        mxEvent.addListener(img, 'click', mxUtils.bind(this, function (evt) {
          this.modelService.addVertex(new Vertex(null, NodeType[icon.type]), state.cell.id, true);
          this.cleanTempImages()
        }));

        state.view.graph.container.appendChild(img);
        this.tempImages.push(img);

      });
    }

    if (permit.addErrorConnection) {
      let icon = imgArr.find(item => item.type === 'redEdge');

      let posX = state.x + state.width + 10;
      let posY = state.y + (icon.index * 30) + 5;
      let img = this.addIcon(`assets/images/${icon.img}`, icon.title, posX, posY);

      mxEvent.addListener(img, 'click', mxUtils.bind(this, function (evt) {

        graph.stopEditing(true);

        var pt = mxUtils.convertPoint(graph.container,
          mxEvent.getClientX(evt), mxEvent.getClientY(evt));

        graph.connectionHandler.createEdgeState = function (me) {
          let edge = graph.createEdge(null, null, null, null, null, 'redEdge');
          return new mxCellState(graph.view, edge, graph.getCellStyle(edge));
        };
        graph.connectionHandler.start(state);
        graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
        mxEvent.consume(evt);
        this.cleanTempImages()
      }));

      state.view.graph.container.appendChild(img);
      this.tempImages.push(img);
    }

    if ('delete' && state.cell.id !== 'root') {
      let array = imgArr.filter(item => item.position === 'left');
      array.forEach(icon => {
        let posX;
        let posY;
        if (state.cell.isVertex()) {
          posX = state.x - 35;
          posY = state.y + 0;
        } else {
          // console.log('STATE', state);
          posX = state.x;
          posY = state.y;
        }


        let img = this.addIcon(`assets/images/${icon.img}`, icon.title, posX, posY);

        mxEvent.addListener(img, 'click', mxUtils.bind(this, function (evt) {
          console.log('CHECK', state.cell.isVertex());
          let edge = state.cell.vertex ? null : state.cell.id;
          let id = state.cell.vertex ? state.cell.id : state.cell.source.id;
          this.modelService.deleteVertex(id, edge);
          this.cleanTempImages()
        }));

        state.view.graph.container.appendChild(img);
        this.tempImages.push(img);

      });
    }

  }

  addMenu(thiz, menu, cell, submenu = null, error: boolean = false) {
    menu.addItem('Оператор ветвления', 'assets/images/split.png', function () {
      let vertex = new Vertex(null, NodeType.BranchNode);
      thiz.modelService.addVertex(vertex, cell.id, error);
    }, submenu);
    menu.addItem('Оператор загрузки данных', 'assets/images/info.png', function () {
      let vertex = new Vertex(null, NodeType.SystemNode);
      thiz.modelService.addVertex(vertex, cell.id, error);
    }, submenu);
    menu.addItem('Оператор сохранения ответа', 'assets/images/record.png', function () {
      let vertex = new Vertex(null, NodeType.SpecifierNode, thiz.vmodel.graph.get(cell.id));
      thiz.modelService.addVertex(vertex, cell.id, error);
    }, submenu);
    menu.addItem('Завершение разговора', 'assets/images/done.png', function () {
      let vertex = new Vertex(null, NodeType.EndNode, thiz.vmodel.graph.get(cell.id));
      thiz.modelService.addVertex(vertex, cell.id, error);
    }, submenu);
  }

  getCellPermissions(cell: Vertex, cellId?: string, isVertex: boolean = true): Permission {

    if (!isVertex) {
      return {addLogicVertex: false, addErrorVertex: false, addLogicConnection: false, addErrorConnection: false};
    }
    let permission: Permission = {
      addLogicVertex: true,
      addErrorVertex: true,
      addLogicConnection: true,
      addErrorConnection: true
    };

    let vertex = cell ? cell : this.vmodel.graph.get(cellId);
    let edges = this.vmodel.edges.get(vertex.id);

    if (edges && edges.find(edge => edge.error === true)) {
      permission.addErrorVertex = false;
      permission.addErrorConnection = false;
    }

    if (vertex.type === NodeType.SpecifierNode) {
      if (edges && edges.find(edge => edge.error === false)) {
        permission.addLogicVertex = false;
        permission.addLogicConnection = false;
      }
    }
    if (vertex.type === NodeType.EndNode) {
      permission.addLogicVertex = false;
      permission.addLogicConnection = false;
    }
    if (vertex.type === NodeType.SystemNode) {
      permission.addErrorConnection = false;
      permission.addErrorVertex = false;
    }
    return permission;
  }

  initStyles() {
    this.graph.getStylesheet().putCellStyle('BranchNode', branchNodeStyle());
    this.graph.getStylesheet().putCellStyle('ClassifierNode', classNodeStyle());
    this.graph.getStylesheet().putCellStyle('SpecifierNode', specNodeStyle());
    this.graph.getStylesheet().putCellStyle('EndNode', endNodeStyle());
    this.graph.getStylesheet().putCellStyle('greenEdge', edgeStyle());
    this.graph.getStylesheet().putCellStyle('redEdge', redArrow);
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


}
