import {NodeType} from '../models/types';

declare var mxConstants: any;

export const arrayControlsImage = [
    {title: 'Завершить диалог', type: NodeType.EndNode, vertex: true, img: 'elips.png', position: 'bottom', index: 3},
    {title: 'Создать ветку', type: NodeType.BranchNode, vertex: true, img: 'rhomb.png', position: 'bottom', index: 0},
    {title: 'Сохранить ответ', type: NodeType.SpecifierNode, vertex: true, img: 'parallel.png', position: 'bottom', index: 1},
    {title: 'Получить данные', type: NodeType.SystemNode, vertex: true, img: 'square.png', position: 'bottom', index: 2},
    {title: 'Добавить связь', type: 'greenEdge', img: 'addConnect.png', vertex: false, position: 'right', index: 0},
    {title: 'Добавить связь в случае ошибки', type: 'redEdge', vertex: false, img: 'addRedConnect.png', position: 'right', index: 1},
    {title: 'Удалить', type: 'delete', vertex: false, img: 'del.png', position: 'left', index: 0}
  ];



export function branchNodeStyle() {
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
  return branchNodeStyle
}

export function classNodeStyle() {
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
  return classNodeStyle;
}

export function specNodeStyle() {
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
  return specNodeStyle;
}

export function endNodeStyle() {
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
  return endNodeStyle
}

export  function edgeStyle() {
  let edgeStyle = {};
  edgeStyle[mxConstants.STYLE_STROKECOLOR] = '#107539';
  edgeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
  edgeStyle[mxConstants.STYLE_VERTICAL_LABEL_POSITION] = 'top';
  edgeStyle[mxConstants.STYLE_VERTICAL_ALIGN] = 'bottom';
  edgeStyle[mxConstants.STYLE_FONTSIZE] = '14';
  return edgeStyle
}

export const redArrow = {
  verticalLabelPosition: 'top',
  verticalAlign: 'bottom',
  strokeWidth: 2,
  strokeColor: '#ff0500',
  fontSize: 14,
  fontColor: '#730017',

};
