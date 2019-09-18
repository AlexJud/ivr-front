import {NodeType} from './../graph/nodes/nodes';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ModelService} from '../services/model.service';
import {EventService} from '../services/event.service';
import {Node} from '../graph/nodes/nodes';
import {ViewNode} from '../view-model-nodes/viewNode';
import {arrayControlsImage} from './graph-settings/properties';
import {GraphViewModel, Vertex} from '../models/vertex';
import {Events} from '../models/events';
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

  viewModel;
  vmodel: GraphViewModel = this.modelService.graphViewModel;

  graph: any;
  parent: any;
  styleSheet = {};
  mxGraphHandler;
  highlight;
  layout;
  // layout2;
  layout3;
  map = new Map();
  node: Node;
  tracker;
  tempImages = [];

  layouts: {
    tree: any;
    organic: any;
    hierarch: any;
  };

  private counterNodeId = 0;

  constructor(private modelService: ModelService,
              private _eventService: EventService) {
  }

  ngOnInit() {
    this.initializeMxGraph();
    this.initStyles();


    this.layout = new mxHierarchicalLayout(this.graph, mxConstants.DIRECTION_WEST);
    this.highlight = new mxCellHighlight(this.graph, '#ff0000', 5);


    this.initListeners();
    this.viewModel = this.modelService.viewModel;

    this.buildGraph();

    // this._eventService._events.addListener('updateGraph', (id) => {
    //   const node = this.modelService.viewModel.get(id);
    //   this.graph.model.setValue(this.map.get(id), node.props[0].value);
    //
    // });
    // this._eventService._events.addListener('highlight', (id) => {
    //   // this._eventService._events.addListener('onHover', (id) => {
    //   let name = this.map.get(id);
    //   this.highlightCellOn(name);
    // });

    // this._eventService._events.addListener('changeLayout', (name) => this.changeLayout(name));
    this._eventService._events.addListener('updateCell', (id) => this.renderNodeFromViewModel(id));
    // this._eventService._events.addListener('onHover', (obj) => this.high(obj));

    // this.tracker = new mxCellTracker(this.graph, '#de7f1c'); // hover cell подсветка


    // this.vmodel.events.addListener(Events.nodeadded, () => {
    //   this.graph.removeCells(this.graph.getChildVertices(this.graph.getDefaultParent()));
    //   this.layout2 = new mxHierarchicalLayout(this.graph, mxConstants.DIRECTION_WEST);
    //   this.buildGraph();
    // });


  }

  redrawGraph() {
    this.graph.removeCells(this.graph.getChildVertices(this.graph.getDefaultParent()));
    this.layout = new mxHierarchicalLayout(this.graph, mxConstants.DIRECTION_WEST);
    // this.layout = this.vmodel.state.graph.layouts['hierarch'];
    // this.buildModel();
    this.buildGraph();
  }

  initListeners() {

    this.vmodel.events.addListener(Events.loadedmodel, () => this.redrawGraph());
    this.vmodel.events.addListener(Events.updatemodel, () => this.redrawGraph());
    this.vmodel.events.addListener(Events.nodeadded, () => this.redrawGraph());
    this.vmodel.events.addListener(Events.edgeadded, () => this.redrawGraph());
    this.vmodel.events.addListener(Events.noderemoved, () => this.redrawGraph());
    this.vmodel.events.addListener(Events.cellhighlight, (obj) => this.high(obj));

    this.vmodel.events.addListener(Events.noderemoved, () => {
      this.graph.removeCells(this.graph.getChildVertices(this.graph.getDefaultParent()));
      this.layout = new mxHierarchicalLayout(this.graph, mxConstants.DIRECTION_WEST);
      this.buildGraph();
    });
    this.graph.setCellsResizable(false);

    this.graph.addListener(mxEvent.CLICK, mxUtils.bind(this, function(sender, evt) {
      if (evt.properties['cell'] && evt.properties['cell'].vertex) {
        this.modelService.graphViewModel.events.emit(Events.cellselected, evt.properties['cell'].id);
      }
    }));

    this.graph.connectionHandler.addListener(mxEvent.CONNECT, mxUtils.bind(this, function(sender, evt) {
      console.log('connection edge', evt);
      let error = evt.properties['cell'].style.indexOf('redEdge') > -1;
      this.modelService.bindVertex(evt.properties.cell.source.id, evt.properties.cell.target.id, error);
    }));

    this.graph.addListener(mxEvent.LABEL_CHANGED, mxUtils.bind(this, function(sender, evt) {
      let idNode = evt.properties['cell'].vertex ? evt.properties['cell'].id : evt.properties['cell'].source.id;
      let node = this.vmodel.graph.get(idNode);

      if (evt.properties['cell'].vertex) {
        let text = evt.properties['value'];
        // if (text.indexOf('(') > -1 && text.lastIndexOf(')') > -1) {
        //   let name = text.substring(text.indexOf('(')+1,text.lastIndexOf(')'))
        //   text = text.substring(0,text.indexOf('(')+1).trim()
        //   console.log('VAR', name);
        //   if (node.type === NodeType.SpecifierNode){
        //     node.props.result.name = name
        //   }
        // }
        node.speech = text;
      } else {
        // let edge;
        if (evt.properties['cell'].style.indexOf('greenEdge') > -1) {
          let childId = evt.properties['cell'].target.id;
          let child = this.vmodel.graph.get(childId);
          let words = [];
          evt.properties.value.split(',').forEach(elem => {
            words.push(elem.trim());
          });
          let edge = child.props.edges.find(el => el.parent.id === node.id);
          edge.match = words;

          if (node.type === NodeType.SpecifierNode) {
            node.props.result.seek = words;
          }
        } else {
          return null;
          // this.buildGraph();
          // edge = parent.edgeIfEmpty.find(node => node.id === evt.properties['cell'].target.id)
        }
      }
    }));

    this.graph.addListener(mxEvent.CLICK, mxUtils.bind(this, function(sender, evt) {
      // console.log('CHANGE ----------- Cell', evt.properties['cell'])

    }));
  }


  high({id, focus}) {
    if (focus) {
      this.highlightCellOn(this.map.get(id));
    } else {
      this.highlightCellReset();
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

      this.graph.setConnectable(true);

      // Disables new connections via "hotspot"
      this.graph.connectionHandler.marker.isEnabled = function() {
        return this.graph.connectionHandler.first != null;
      };
      // this.graph.cellLabelChanged = function (cell, value, autoSize) {
      //   this.graph.setValue(cell,value)
      //   console.log('LABEL CHANGED ',cell)
      //   console.log('LABEL CHANGED 2',value)
      // }


      // mxIconSet.prototype.destroy = function()
      // {
      //   if (thiz.images != null)
      //   {
      //     for (var i = 0; i < this.images.length; i++)
      //     {
      //       var img = this.images[i];
      //       img.parentNode.removeChild(img);
      //     }
      //   }
      //
      //   this.images = null;
      // };


      this.graph.addMouseListener({

        currentState: null,
        currentIconSet: null,

        mouseDown: function(sender, me) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState);
            this.currentState = null;
          }
        },
        mouseMove: function(sender, me) {
          if (this.currentState != null) {// && (me.getState() == this.currentState || me.getState() == null))
            let offset = 70;
            let tmp = new mxRectangle(me.getGraphX() - offset,
              me.getGraphY() - offset, 2 * offset, 2 * offset);
            if (mxUtils.intersects(tmp, this.currentState)) {
              return;
            }
          }

          var tmp = thiz.graph.view.getState(me.getCell());

          // Ignores everything but vertices
          if (thiz.graph.isMouseDown || (tmp != null && !thiz.graph.getModel().isVertex(tmp.cell))) {
            tmp = null;
          }

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
        mouseUp: function(sender, me) {
        },
        dragEnter: function(evt, state) {
          if (this.currentIconSet == null) {
            this.currentIconSet = thiz.mxIconSet(state);
          }
        },
        dragLeave: function(evt, state) {
          // if (this.currentIconSet !== null) {
          if (!this.currentIconSet) {
            if (thiz.tempImages) {
              thiz.tempImages.forEach(i => {
                i.parentNode.removeChild(i);
              });
            }
            this.currentIconSet = null;
          }
        }
      });


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

      this.graph.popupMenuHandler.factoryMethod = function(menu, cell, evt) {
        if (!cell || cell.edge) {
          return;
        }
        console.log('CELL ', cell);
        let node = thiz.vmodel.graph.get(cell.id);
        console.log('CELL 2', node);
        // let node = thiz.modelService.viewModel.get(cell.id);
        if (node.type !== NodeType.EndNode) {
          let submenu = node.type === NodeType.SpecifierNode;

          if (submenu) {
            let ok;
            let err;
            node.child.forEach(elem => {
              let edges = elem.props.edges.filter(edge => edge.parent.id === node.id);
              if (!ok) {
                ok = edges.find(item => item.error === false);
              }
              if (!err) {
                err = edges.find(item => item.error);
              }
            });

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

        menu.addItem('Удалить', 'assets/images/delete.png', function() {
          thiz.deleteNode(cell.id);
        });
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
      mxUtils.bind(this, function(evt) {
        mxEvent.consume(evt);
      })
    );

    return img;
  }

  mxIconSet(state) {
    this.tempImages = [];
    let graph = this.graph;
    let imgArr = arrayControlsImage;
    let permit = this.getCellPermissions(null, state.cell.id);
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

        mxEvent.addListener(img, 'click', mxUtils.bind(this, function(evt) {
          // this.createNewNode(imgArr[i].type, state.cell.id);
          this.modelService.addVertex(new Vertex(null, NodeType[icon.type]), state.cell.id);
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

      mxEvent.addListener(img, 'click', mxUtils.bind(this, function(evt) {
        var pt = mxUtils.convertPoint(graph.container,
          mxEvent.getClientX(evt), mxEvent.getClientY(evt));

        graph.connectionHandler.createEdgeState = function(me) {
          let edge = graph.createEdge(null, null, null, null, null, 'greenEdge');
          return new mxCellState(graph.view, edge, graph.getCellStyle(edge));
        };
        graph.connectionHandler.start(state);
        graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
        mxEvent.consume(evt);
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

        mxEvent.addListener(img, 'click', mxUtils.bind(this, function(evt) {
          // this.createNewNode(imgArr[i].type, state.cell.id);
          this.modelService.addVertex(new Vertex(null, NodeType[icon.type]), state.cell.id, true);
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

      mxEvent.addListener(img, 'click', mxUtils.bind(this, function(evt) {
        // if (!mxClient.IS_TOUCH) {
        // mxEvent.redirectMouseEvents(state.cell, graph, state);
        // console.log('TOUCH', state);
        // }
        // graph.popupMenuHandler.hideMenu();
        graph.stopEditing(true);

        var pt = mxUtils.convertPoint(graph.container,
          mxEvent.getClientX(evt), mxEvent.getClientY(evt));
        // console.log('ConnectionHandler',graph.connectionHandler)

        graph.connectionHandler.createEdgeState = function(me) {
          // let edge;
          // if (icon.type === 'greenEdge') {
          let edge = graph.createEdge(null, null, null, null, null, 'redEdge');
          // } else {
          //   edge = graph.createEdge(null, null, null, null, null, 'redEdge');
          // }
          return new mxCellState(graph.view, edge, graph.getCellStyle(edge));
        };
        graph.connectionHandler.start(state);
        // graph.isMouseDown = true;
        graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
        mxEvent.consume(evt);
      }));

      state.view.graph.container.appendChild(img);
      this.tempImages.push(img);
    }

    if('delete'){
      let array = imgArr.filter(item => item.position === 'left');
      array.forEach(icon => {
        let posX = state.x -35;
        let posY = state.y + 0;
        let img = this.addIcon(`assets/images/${icon.img}`, icon.title, posX, posY);

        mxEvent.addListener(img, 'click', mxUtils.bind(this, function(evt) {
          this.modelService.deleteVertex(state.cell.id)
        }));

        state.view.graph.container.appendChild(img);
        this.tempImages.push(img);

      });
    }

  }

  addMenu(thiz, menu, cell, submenu = null, error: boolean = false) {
    menu.addItem('Оператор ветвления', 'assets/images/split.png', function() {
      let vertex = new Vertex(null, NodeType.BranchNode);
      thiz.modelService.addVertex(vertex, cell.id, error);
    }, submenu);
    menu.addItem('Оператор загрузки данных', 'assets/images/info.png', function() {
      let vertex = new Vertex(null, NodeType.SystemNode);
      thiz.modelService.addVertex(vertex, cell.id, error);
    }, submenu);
    menu.addItem('Оператор сохранения ответа', 'assets/images/record.png', function() {
      let vertex = new Vertex(null, NodeType.SpecifierNode, thiz.vmodel.graph.get(cell.id));
      thiz.modelService.addVertex(vertex, cell.id, error);
    }, submenu);
    menu.addItem('Завершение разговора', 'assets/images/done.png', function() {
      let vertex = new Vertex(null, NodeType.EndNode, thiz.vmodel.graph.get(cell.id));
      thiz.modelService.addVertex(vertex, cell.id, error);
    }, submenu);
  }


  // private createNewNode(nodeType: NodeType, parentId: string, error: boolean = false) {
  //   const id = 'Node_' + this.counterNodeId++;
  //   this.modelService.addNewViewNode(id, nodeType, parentId, error);
  //   // this._eventService._events.emit('updateModel');
  // }

  // addChild(cell) {
  //   this.graph.clearSelection();
  //
  //   let model = this.graph.getModel();
  //   let vertex;
  //
  //   model.beginUpdate();
  //   try {
  //     var geo = this.graph.getCellGeometry(cell);
  //     vertex = this.graph.insertVertex(this.parent, null, '', geo.x, geo.y, 120, 80);
  //
  //     this.graph.view.refresh(vertex);
  //     let geometry = model.getGeometry(vertex);
  //     var edge = this.graph.insertEdge(this.parent, null, '', cell, vertex, 'greenEdge');
  //     this.addOverlay(vertex);
  //
  //   } finally {
  //     model.endUpdate();
  //     this.layout.execute(this.parent);
  //     // var morph = new mxMorphing(this.graph);
  //
  //     // morph.addListener(mxEvent.DONE, mxUtils.bind(this, function()
  //     // {
  //     //   this.graph.getModel().endUpdate();
  //     //
  //     //   // if (post != null)
  //     //   // {
  //     //   //   post();
  //     //   // }
  //     // }));
  //     //
  //     // morph.startAnimation();
  //     // this.graph.view.refresh()
  //   }
  //   return vertex;
  //
  // }

  getCellPermissions(cell: Vertex, cellId?: string): Permission {
    let vertex = cell ? cell : this.vmodel.graph.get(cellId);
    let permission: Permission = {addLogicVertex: true, addErrorVertex: true, addLogicConnection: true, addErrorConnection: true};

    if (vertex.props.state.errorEdge) {
      permission.addErrorVertex = false;
      permission.addErrorConnection = false;
    }

    if (vertex.type === NodeType.SpecifierNode) {
      if (vertex.props.state.logicEdge) {
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

  renderNodeFromViewModel(id) {
    console.log('UPDATE ', id);
    let cell = this.graph.model.getCell(id);
    let viewNode = this.viewModel.get(id);
    this.graph.model.setValue(cell, viewNode.props[0].value);
    console.log('NODE', cell);
    viewNode.edgeList.forEach(child => {
      let edge = cell.edges.find(target => target.target.id === child.id);
      // console.l
      if (child.match) {
        this.graph.model.setValue(edge, child.match[0]);
      } else {
        let value = viewNode.props.find(item => item.name === 'Ключевые слова');
        this.graph.model.setValue(edge, value.value[0]);
      }
    });
    console.log('EDGE;', viewNode);
  }


  private buildGraph() {
    let mapCells = new Map<string, any>();

    //   var value = {
    //    first : 'First value',
    //   second : 'Second value'
    // }
    this.graph.getModel().beginUpdate();
    try {
      this.vmodel.graph.forEach((node: Vertex) => {
        let vert = this.graph.insertVertex(this.parent, node.id, node.speech, 0, 0, 120, 80, node.type);
        // let label11 = this.graph.insertVertex(vert, null, 'Label1', 0.5, 1.1, 0, 0, null, true);
        mapCells.set(node.id, vert);
        this.map.set(node.id, vert);
      });
      this.vmodel.graph.forEach((node: Vertex) => {
        if (node.props.edges.length > 0) {
          node.props.edges.forEach(elem => {
            let edge = this.graph.insertEdge(this.parent, null, elem.match[0], mapCells.get(elem.parent.id), mapCells.get(node.id), elem.error ? 'redEdge' : 'greenEdge');
          });
        }
      });


    } catch (e) {
      console.error('Error rendex graph', e);
    } finally {
      this.layout.execute(this.parent);
      this.graph.getModel().endUpdate();
      console.log('GRAPH ', this.graph.model.cells);
    }

  }

  // ПОДСВЕТКА ЯЧЕКИ
  highlightCellOn(cell) {
    this.highlight.highlight(this.graph.view.getState(cell));
  }

  highlightCellReset() {
    this.highlight.resetHandler();
  }


  public deleteNode(id: string) {
    this.modelService.deleteVertex(id);
    // this._eventService._events.emit('updateModel');
  }

  // changeLayout(name) {
  //   switch (name) {
  //     case 'tree':
  //       return this.layouts.tree.execute(this.parent);
  //     case 'organic':
  //       return this.layouts.organic.execute(this.parent);
  //     case 'hierarch':
  //       return this.layouts.hierarch.execute(this.parent);
  //   }
  // }


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
    edgeStyle[mxConstants.STYLE_VERTICAL_LABEL_POSITION] = 'top';
    edgeStyle[mxConstants.STYLE_VERTICAL_ALIGN] = 'bottom';
    edgeStyle[mxConstants.STYLE_FONTSIZE] = '14';

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

  addOverlay(cell: string) {
    var overlay = new mxCellOverlay(new mxImage('/assets/images/rarrow.png', 24, 24), 'Add child');
    overlay.cursor = 'hand';

    // overlay.align = mxConstants.ALIGN_CENTER;
    // overlay.verticalAlign = mxConstants.ALIGN_MIDDLE
    overlay.addListener(mxEvent.CLICK, mxUtils.bind(this, function(sender, evt) {
      this.addChild(cell);
    }));

    this.graph.addCellOverlay(cell, overlay);

  }

  public addNode(id: string) {
    const viewNode = this.modelService.viewModel.get(id);
    this.graph.getModel().beginUpdate();
    try {
      let vObj = this.graph.insertVertex(this.parent, viewNode.id, '', 0, 0, 120, 80, viewNode.type);
      //let vCell = this.graph.insertVertex(vObj, null, node.id, 0, 20, 120, 40, this.styleCell);
      this.map.set(viewNode.id, vObj);
      this.graph.insertEdge(this.parent, null, '', this.map.get(viewNode.parent), vObj, 'greenEdge');
    } finally {
      this.layout.execute(this.parent);
      this.graph.getModel().endUpdate();
    }
  }

  private addNewNode(id: string, type: string, parent: string, error: boolean = false) {
    let style = error ? 'redEdge' : 'greenEdge';

    this.graph.getModel().beginUpdate();
    let vObj;
    try {
      vObj = this.graph.insertVertex(this.parent, id, '', 0, 0, 120, 80, type);
      this.map.set(id, vObj);
      // this.graph.insertEdge(this.parent, null, '', this.map.get(parent), vObj, 'greenEdge');
      let edge = this.graph.insertEdge(this.parent, null, '', this.map.get(parent), vObj, style);
    } finally {
      this.layout.execute(this.parent);
      this.graph.getModel().endUpdate();
      // let element = this.graph.view.getState(vObj).shape.node
      // var clickEvent  = document.createEvent ('MouseEvents');
      // clickEvent.initEvent('dblclick', true, true);
      // element.dispatchEvent(clickEvent);
    }
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
            mxEdgeHandler.prototype.isConnectableCell = function(cell) {
              console.log('CHECK IS CONNECT', cell);
              // return this.graph.connectionHandler.isConnectableCell(cell);
            };
            console.log('EDGE ', edge);

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

}
