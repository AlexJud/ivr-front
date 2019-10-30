import {NodeType} from '../models/types';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ModelService} from '../services/model.service';
import {
  arrayControlsImage,
  branchNodeStyle,
  classNodeStyle, edgeStyle, endNodeStyle, mergeSymbolStyle,
  redArrow,
  specNodeStyle
} from './properties';
import {Vertex} from '../models/vertex';
import {Events} from '../models/events';
import {GraphViewModel} from '../models/graph-v-model';
import {Edge} from '../models/edge';
// import {mxResources, mxVertexHandler} from "mxgraph";
import * as _ from 'lodash';
import {map} from 'rxjs/operators';

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
declare var mxGeometry: any;

// declare var require: any;
// const mx = require('mxgraph')
// // ({
// //   mxImageBasePath: 'assets/mxgraph/images',
// //   mxBasePath: 'assets/mxgraph'
// // });

type Permission = { addLogicVertex: boolean, addErrorVertex: boolean, addLogicConnection: boolean, addErrorConnection: boolean }
type LabelEdge = { name: string, variable: string }

const rhombShape = 'mergeSymbol';

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

    this.graph.addListener(mxEvent.CLICK, mxUtils.bind(this, function(sender, evt) {
      console.log('CLICK', evt);
      let cell = evt.properties['cell'];
      // console.log('CLICK', this.vmodel.graph.get(evt.properties['cell'].id));
      if (cell) {

        console.log('THIS> model', this.graph.model.getCell('Edge0'));


        if (cell.vertex && cell.style !== rhombShape) {
          return this.vmodel.events.emit(Events.nodeselected, {vertex: cell.id, edge: null});
        }

        if (cell.edge && cell.target.style !== rhombShape) {
          // let sourceId = cell.source === rhombShape ? evt.properties['cell'].source.id : evt.properties['cell'].source.id.substring(1);
          let sourceId;
          if (cell.source.style === rhombShape) {
            let incoms = this.graph.model.getIncomingEdges(cell.source);
            sourceId = incoms[0].source.id;
          } else {
            sourceId = cell.source.id;
          }
          let edges = this.vmodel.edges.get(sourceId);
          let edge = edges.find(rec => rec.id === cell.id);
          return this.vmodel.events.emit(Events.nodeselected, {vertex: null, edge: edge});
        }
        this.vmodel.events.emit(Events.nodeselected, {vertex: null, edge: null});
      }
    }));

    this.graph.connectionHandler.addListener(mxEvent.CONNECT, mxUtils.bind(this, function(sender, evt) {

      let cell = evt.properties['cell'];
      let edges = this.vmodel.edges.get(cell.source.id);

      if (edges && edges.find(edge => edge.match.length === 0)) { //&& edge.child.id === evt.properties['cell'].target.id)
        alert('Не допускается двух связей без ключевых слов');
        console.log('EDGES', edges.find(edge => edge.match.length === 0));
        this.vmodel.events.emit(Events.updatemodel);
        return;
      }
      let error = cell.style.indexOf('redEdge') > -1;

      if (cell.target.style === rhombShape) {
        console.log('TRACE Connection to rhombus ---> cory edges from parent');
        let array = [];
        let parentId;

        // this.graph.model.getOutgoingEdges(cell).forEach(edge => {
        console.log('RHOMBUS ', cell);
        let data = this.graph.model.getOutgoingEdges(cell.target);
        console.log('DATA EDGEAS ', data);
        data.forEach(edge => {
          console.log('TRACE OUTHOING 1111111');
          array.push(edge.id);
          if (!parentId) {
            parentId = this.vmodel.graph.get(edge.target.id).parent[0].id;
            console.log('TRACE PARENT ', parentId);
          }
        });
        console.log('TRACE OUTHOING');
        this.modelService.copyEdges(parentId, cell.source.id, array);
      } else {
        this.modelService.bindVertex(cell.source.id, cell.target.id, error);
      }
    }));

    this.graph.addListener(mxEvent.LABEL_CHANGED, mxUtils.bind(this, function(sender, evt) {
      let cell = evt.properties['cell'];

      if (cell.style !== rhombShape) {
        if (cell.vertex) {
          let node = this.vmodel.graph.get(cell.id);
          let text = evt.properties['value'];
          node.speech = text;

        } else if (cell.target.style !== rhombShape) {
          let sourceId;
          if (cell.source.style === rhombShape) {
            let incoms = this.graph.model.getIncomingEdges(cell.source);
            sourceId = incoms[0].source.id;
          } else {
            sourceId = cell.source.id;
          }
          let edge = this.vmodel.edges.get(sourceId).find(item => item.id === cell.id);

          let words = [];
          evt.properties.value.split(',').forEach(elem => {
            words.push(elem.trim());
          });
          edge.match = words;
          this.vmodel.events.emit(Events.updatemodel);
        }
      }
    }));

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
        if (this.currentState != null) {// && (me.getState() == this.currentState || me.getState() == null)) {//  //
          let offset;
          if (this.currentState.cell.vertex) {
            // console.log('TRACE CELLLL', me)
            offset = 30;
          } else {
            offset = 5;
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
      mouseUp: function(sender, me) {
      },
      dragEnter: function(evt, state) {
        // console.log('ENTER',state)
        if (this.currentIconSet == null && state.cell.style !== rhombShape) {
          this.currentIconSet = thiz.mxIconSet(state);
        }
      },
      dragLeave: function(evt, state) {
        // console.log('CURRENT ICON SET ',thiz.tempImages)
        if (!this.currentIconSet) {
          if (thiz.tempImages.length > 0) {
            thiz.tempImages.forEach(i => {
              i.parentNode.removeChild(i);
            });
          }
          this.currentIconSet = null;
          thiz.tempImages = [];
        }
      }
    });

    const thiz = this;

    mxEvent.addMouseWheelListener(function(evt, up) {
      // console.log('eventListener', evt, '  up ', up);
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
    let mapRhombuses = new Map<string, any>();

    let mapPairs = new Map<string, Edge[]>();

    console.log('GRAPH', this.vmodel.graph);
    console.log('GRAPH E', this.vmodel.edges);

    this.vmodel.edges.forEach((v: Edge[], k) => {
      v.forEach(edge => {
        let item = mapPairs.get(edge.id);
        if (!item) {
          item = [];
        }
        item.push(edge);
        mapPairs.set(edge.id, item);
      });
    });
    console.log('MapPairs', mapPairs);

    this.graph.getModel().beginUpdate();
    try {
      // draw vertexes
      this.vmodel.graph.forEach((node: Vertex) => {
        let vert = this.graph.insertVertex(this.parent, node.id, node.speech, 0, 0, 120, 80, node.type);
        // let vert = this.graph.insertVertex(this.parent, node.id, node.id, 0, 0, 120, 80, node.type);
        mapCells.set(node.id, vert);
      });


      // draw edges

      // this.vmodel.edges.forEach((v: Edge[], k: string) => {
      //   let redEdges: Edge[] = [];
      //   let greenEdges: Edge[] = [];
      //
      //   v.forEach(edge => {
      //     edge.error ? redEdges.push(edge) : greenEdges.push(edge);
      //   });
      //
      //   if (greenEdges.length > 1) {
      //     console.log('KEY', k);
      //     console.log('MAP RHOMBUS 1', mapRhombuses);
      //
      //     let target;
      //     let arrayLocalRhombus = [];
      //     let arrayNewEdges = [];
      //
      //     greenEdges.forEach(edge => {
      //
      //
      //       if (mapRhombuses.get(edge.id)) {
      //         target = mapRhombuses.get(edge.id);
      //         if (arrayLocalRhombus.indexOf(target) === -1) {
      //           let elem = this.graph.insertEdge(this.parent, null, null, mapCells.get(k), target, 'greenEdge');
      //           arrayLocalRhombus.push(target);
      //         }
      //       } else {
      //         arrayNewEdges.push(edge);
      //         // console.log('ARRAY ',arrayNewEdges)
      //       }
      //
      //
      //     });
      //     console.log('TRACE BEFORE NEW ADDED', arrayNewEdges);
      //     if (arrayNewEdges.length > 1) {
      //       console.log('TRACE LENGTH > 1');
      //       let rhomb = this.graph.insertVertex(this.parent, '_' + k, null, 0, 0, 40, 40, 'mergeSymbol');
      //       let elem = this.graph.insertEdge(this.parent, null, null, mapCells.get(arrayNewEdges[0].parent.id), rhomb, 'greenEdge');
      //
      //       arrayNewEdges.forEach(edge => {
      //         mapRhombuses.set(edge.id, rhomb);
      //
      //         this.graph.insertEdge(this.parent, edge.id, edge.match[0], rhomb, mapCells.get(edge.child.id), 'greenEdge');
      //       });
      //     } else if (arrayNewEdges.length === 1) {
      //       console.log('TRACE LENGTH = 1', arrayNewEdges[0]);
      //       this.graph.insertEdge(this.parent, arrayNewEdges[0].id, arrayNewEdges[0].match[0], mapCells.get(arrayNewEdges[0].parent.id), mapCells.get(arrayNewEdges[0].child.id), 'greenEdge');
      //     }
      //
      //   } else if (greenEdges.length === 1) {
      //     console.log('EDGE GREEN ', greenEdges);
      //     let elem = this.graph.insertEdge(this.parent, greenEdges[0].id, greenEdges[0].match[0], mapCells.get(greenEdges[0].parent.id), mapCells.get(greenEdges[0].child.id), 'greenEdge');
      //   }
      //   console.log('EDGE RED ', redEdges);
      //   redEdges.forEach(rEdge => {
      //     let elem = this.graph.insertEdge(this.parent, rEdge.id, rEdge.match[0], mapCells.get(rEdge.parent.id), mapCells.get(rEdge.child.id), 'redEdge');
      //
      //   });
      //   console.log('MAP RHOMBUS 2', mapRhombuses);
      //
      // });


      // draw Edges - second way
      console.log('PAIRS ----------11', mapPairs);
      this.vmodel.edges.forEach((value: Edge[], key) => {
        let pairsGroupsArr = [];
        let aloneEdgesArr = [];

        value.forEach(edge => {
          let pairs = mapPairs.get(edge.id);
          if (pairs.length > 1 && !pairs[0].error) {
            console.log('pairsGrou  !!!!!!!!!!!!!!!!!', pairsGroupsArr);
            // console.log('Target -------------', target)
            let addnew = true;

            pairsGroupsArr = pairsGroupsArr.map((elem: Edge[]) => {
              let temp = _.intersectionBy(elem, pairs, 'parent.id');
              // console.log('PAIRS INTERSECTON', temp)
              // console.log('PAIRS INTERSECTON 2', temp.length === pairs.length)
              if (temp.length === pairs.length) {
                addnew = false;
                return _.concat(elem, pairs);
              }
              return elem;
            });

            if (addnew) {
              pairsGroupsArr.push(pairs);
            }
          } else if (pairs.length > 1 && pairs[0].error) {
            alert('Надо доделать')
          } else {
            if (pairs[0].error === false) {
              aloneEdgesArr.push(pairs);
            }
          }
        });

        console.log('NEW WAY TO DRAW EDGES - pairs', pairsGroupsArr,);
        console.log('NEW WAY TO DRAW EDGES - alone', aloneEdgesArr,);

        pairsGroupsArr.forEach((group: Edge[]) => {
          if (!mapRhombuses.get(group[0].id)) {
            let rhomb = this.graph.insertVertex(this.parent, null, null, 0, 0, 40, 40, 'mergeSymbol');
            group.forEach(edge => mapRhombuses.set(edge.id, rhomb));
          }
        });

        if (aloneEdgesArr.length > 1) {
          let rhomb = this.graph.insertVertex(this.parent, null, null, 0, 0, 40, 40, 'mergeSymbol');
          aloneEdgesArr.forEach((edge: Edge[]) => mapRhombuses.set(edge[0].id, rhomb));
        }

      });

      // draw arrows

      this.vmodel.edges.forEach((value: Edge[], key) => {
        value.forEach(edge => {
          let target = mapRhombuses.get(edge.id);
          if (!target) {
            let elem = this.graph.insertEdge(this.parent, edge.id, edge.match[0], mapCells.get(edge.parent.id), mapCells.get(edge.child.id), edge.error ? 'redEdge' : 'greenEdge');
            // let elem = this.graph.insertEdge(this.parent, edge.id, edge.id, mapCells.get(edge.parent.id), mapCells.get(edge.child.id), edge.error ? 'redEdge' : 'greenEdge');
          } else {
            // console.log('GET BEETWEEN', this.graph.model.getEdgesBetween(mapCells.get(edge.parent.id), target));
            // console.log('GET BEETWEEN 2', this.graph.model.getEdgesBetween(target, mapCells.get(edge.child.id)));
            if ((this.graph.model.getEdgesBetween(mapCells.get(edge.parent.id), target)).length === 0) {
              let elem = this.graph.insertEdge(this.parent, null, null, mapCells.get(edge.parent.id), target, 'greenEdge');
            }
            if ((this.graph.model.getEdgesBetween(target, mapCells.get(edge.child.id))).length === 0) {
              let elem = this.graph.insertEdge(this.parent, edge.id, edge.match[0], target, mapCells.get(edge.child.id), 'greenEdge');
              // let elem = this.graph.insertEdge(this.parent, edge.id,edge.id, target, mapCells.get(edge.child.id), 'greenEdge');
            }
            // if (!arrayRhomb.find(elem => elem.id === target.id)) {
            //   let elem = this.graph.insertEdge(this.parent, null, null, mapCells.get(edge.parent.id), target, 'greenEdge');
            //   arrayRhomb.push(target);
            // }
            //
            // if (!this.graph.model.getCell(edge.id)) {
            //   this.graph.insertEdge(this.parent, edge.id, edge.match[0], target, mapCells.get(edge.child.id), 'greenEdge');
            // }
          }
        });
      });


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
    this.tempImages = [];
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
      this.parent.setGeometry(new mxGeometry(300, 300, 0, 0));
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
      this.graph.connectionHandler.marker.isEnabled = function() {
        return this.graph.connectionHandler.first != null;
      };

      //
      // this.graph.getEditingValue = (cell, evt) => {
      //   // evt.fieldname = getFieldnameForEvent(cell, evt);
      //   console.log('CONTROLS ', cell, '  2  ', evt);
      //
      //   // return cell.value[evt.fieldname] || '';
      //   return cell.vertex ? cell.value : cell.value.name;
      // };
      //
      // this.graph.getLabel = (cell) => {
      //   console.log('LABEL ',cell)
      //   if(cell.vertex){
      //     return cell.value || '1';
      //   } else {
      //     let body = document.createElement('div');
      //     let text1 = document.createElement('div')
      //     let text2 = document.createElement('div')
      //     mxUtils.write(text1,cell.value.name)
      //     mxUtils.write(text2,cell.value.variable)
      //     body.appendChild(text1);
      //     // body.appendChild(document.createElement('br'))
      //     body.appendChild(text2);
      //
      //
      //     return body;
      //
      //     // return cell.value.name;
      //   }
      //
      // };


      const thiz = this;

      this.graph.popupMenuHandler.factoryMethod = function(menu, cell, evt) {
        if (!cell) {
          return;
        }
        if (cell.isVertex()) {
          let node = thiz.vmodel.graph.get(cell.id);
          console.log('current NODE DATA', thiz.vmodel.edges);
          // let node = thiz.modelService.viewModel.get(cell.id);


          if (!node || node.type !== NodeType.EndNode) {


            // let submenu = node.type === NodeType.SpecifierNode;
            //
            // if (submenu) {
            //   let edges = thiz.vmodel.edges.get(node.id);
            //   let ok = edges ? edges.find(edge => edge.error === false) : null;
            //   let err = edges ? edges.find(edge => edge.error === true) : null;
            //
            //   if (!ok) {
            //     submenu = menu.addItem('Ответ получен', null, null);
            //     thiz.addMenu(thiz, menu, cell, submenu);
            //   }
            //   if (!err) {
            //     submenu = menu.addItem('Eсли ошибка', null, null);
            //     thiz.addMenu(thiz, menu, cell, submenu, true);
            //   }
            // } else {

            thiz.addMenu(thiz, menu, cell);
            if (!node) {
              return;
            }

            // }
          }

        }
        if (!(cell.id === 'root')) {
          menu.addItem('Удалить', 'assets/images/delete.png', function() {

            if (cell.vertex) {
              thiz.modelService.deleteVertex(cell.id);
            } else {
              if (cell.source.style === rhombShape) {
                let array = [];
                let parents = thiz.vmodel.graph.get(cell.target.id).parent;
                parents.forEach(vertex => array.push(vertex.id));
                thiz.modelService.deleteEdges(array, Array.of(cell.id));
              } else if (cell.target.style === rhombShape) {
                let array = [];
                let graphEdges = thiz.graph.model.getOutgoingEdges(thiz.graph.model.getCell(cell.target.id));
                graphEdges.forEach(edge => array.push(edge.id));
                thiz.modelService.deleteEdges(Array.of(cell.source.id), array);
              } else {
                console.log('EWRWERWER', cell);
                thiz.modelService.deleteEdges(Array.of(cell.source.id), Array.of(cell.id));
              }
            }
            // let edgeId = cell.vertex ? null : cell.id;
            // let id = cell.vertex ? cell.id : cell.source.id;
            // thiz.modelService.deleteVertex(id, edgeId);
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
    let permit = this.getCellPermissions(null, state.cell.id, state.cell.isVertex());
    let node = this.vmodel.graph.get(state.cell.id);

    if (state.cell.style === NodeType.EndNode) {
      return;
    }

    // if (permit.addLogicVertex) {
    //   let array = imgArr.filter(item => item.position === 'bottom');
    //   array.forEach(icon => {
    //     let posX = state.x + (icon.index * 30) + 5;
    //     let posY = state.y + state.height + 10;
    //     let img = this.addIcon(`assets/images/${icon.img}`, icon.title, posX, posY);
    //
    //     mxEvent.addListener(img, 'click', mxUtils.bind(this, function(evt) {
    //       this.modelService.addVertex(new Vertex(null, NodeType[icon.type]), state.cell.id);
    //       this.cleanTempImages();
    //     }));
    //
    //     state.view.graph.container.appendChild(img);
    //     this.tempImages.push(img);
    //   });
    // }


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
        this.cleanTempImages();
      }));

      state.view.graph.container.appendChild(img);
      this.tempImages.push(img);
    }

    // if (permit.addErrorVertex) {
    //   let array = imgArr.filter(item => item.position === 'bottom');
    //   array.forEach(icon => {
    //     let posX = state.x + (icon.index * 30) + 5;
    //     let posY = state.y + state.height + 10 + 30;
    //     let img = this.addIcon(`assets/images/${icon.img}`, icon.title, posX, posY);
    //
    //     mxEvent.addListener(img, 'click', mxUtils.bind(this, function(evt) {
    //       this.modelService.addVertex(new Vertex(null, NodeType[icon.type]), state.cell.id, true);
    //       this.cleanTempImages();
    //     }));
    //
    //     state.view.graph.container.appendChild(img);
    //     this.tempImages.push(img);
    //
    //   });
    // }

    if (permit.addErrorConnection) {
      let icon = imgArr.find(item => item.type === 'redEdge');

      let posX = state.x + state.width + 10;
      let posY = state.y + (icon.index * 30) + 5;
      let img = this.addIcon(`assets/images/${icon.img}`, icon.title, posX, posY);

      mxEvent.addListener(img, 'click', mxUtils.bind(this, function(evt) {

        graph.stopEditing(true);

        var pt = mxUtils.convertPoint(graph.container,
          mxEvent.getClientX(evt), mxEvent.getClientY(evt));

        graph.connectionHandler.createEdgeState = function(me) {
          let edge = graph.createEdge(null, null, null, null, null, 'redEdge');
          return new mxCellState(graph.view, edge, graph.getCellStyle(edge));
        };
        graph.connectionHandler.start(state);
        graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
        mxEvent.consume(evt);
        this.cleanTempImages();
      }));

      state.view.graph.container.appendChild(img);
      this.tempImages.push(img);
    }

    // if ('delete' && state.cell.id !== 'root') {
    //   let array = imgArr.filter(item => item.position === 'left');
    //   array.forEach(icon => {
    //     let posX;
    //     let posY;
    //     if (state.cell.isVertex()) {
    //       posX = state.x - 35;
    //       posY = state.y + 0;
    //     } else {
    //       // console.log('STATE', state);
    //       posX = state.x;
    //       posY = state.y;
    //     }
    //
    //
    //     let img = this.addIcon(`assets/images/${icon.img}`, icon.title, posX, posY);
    //
    //     mxEvent.addListener(img, 'click', mxUtils.bind(this, function(evt) {
    //       console.log('CHECK', state.cell.isVertex());
    //       let edge = state.cell.vertex ? null : state.cell.id;
    //       let id = state.cell.vertex ? state.cell.id : state.cell.source.id;
    //       this.modelService.deleteVertex(id, edge);
    //       this.cleanTempImages();
    //     }));
    //
    //     state.view.graph.container.appendChild(img);
    //     this.tempImages.push(img);
    //
    //   });
    // }

  }

  addMenu(thiz, menu, cell, submenu = null, error: boolean = false) {
    let parentsArray = [];
    console.log('PARENT ===========', cell);
    if (cell.style === rhombShape) {
      this.graph.model.getIncomingEdges(cell).forEach(parent => parentsArray.push(parent.source.id));
    } else {
      parentsArray.push(cell.id);
    }

    menu.addItem('Оператор ветвления', 'assets/images/split.png', function() {
      let vertex = new Vertex(null, NodeType.BranchNode);
      thiz.modelService.addVertex(vertex, parentsArray, error);
    }, submenu);
    menu.addItem('Оператор загрузки данных', 'assets/images/info.png', function() {
      let vertex = new Vertex(null, NodeType.SystemNode);
      thiz.modelService.addVertex(vertex, parentsArray, error);
    }, submenu);
    // menu.addItem('Оператор сохранения ответа', 'assets/images/record.png', function() {
    //   let vertex = new Vertex(null, NodeType.SpecifierNode, thiz.vmodel.graph.get(cell.id));
    //   thiz.modelService.addVertex(vertex, cell.id, error);
    //   thiz.modelService.addVertex(vertex, cell.id, error);
    // }, submenu);
    menu.addItem('Завершение разговора', 'assets/images/done.png', function() {
      let vertex = new Vertex(null, NodeType.EndNode); // thiz.vmodel.graph.get(cell.id)
      thiz.modelService.addVertex(vertex, parentsArray, error);
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

    this.graph.getStylesheet().putCellStyle('mergeSymbol', mergeSymbolStyle());

    this.graph.getStylesheet().putCellStyle('greenEdge', edgeStyle());
    this.graph.getStylesheet().putCellStyle('redEdge', redArrow);
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


}
