import {NodeType} from '../../graph/nodes/nodes';

export const arrayControlsImage = [
    {title: 'Завершить диалог', type: NodeType.EndNode, vertex: true, img: 'elips.png', position: 'bottom', index: 3},
    {title: 'Создать ветку', type: NodeType.BranchNode, vertex: true, img: 'rhomb.png', position: 'bottom', index: 0},
    {title: 'Сохранить ответ', type: NodeType.SpecifierNode, vertex: true, img: 'parallel.png', position: 'bottom', index: 1},
    {title: 'Получить данные', type: NodeType.SystemNode, vertex: true, img: 'square.png', position: 'bottom', index: 2},
    {title: 'Добавить связь', type: 'greenEdge', img: 'addConnect.png', vertex: false, position: 'right', index: 0},
    {title: 'Добавить связь в случае ошибки', type: 'redEdge', vertex: false, img: 'addRedConnect.png', position: 'right', index: 1},
    {title: 'Удалить', type: 'delete', vertex: false, img: 'del.png', position: 'left', index: 0}
  ];
