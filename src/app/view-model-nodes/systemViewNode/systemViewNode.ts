import { ViewNode } from '../viewNode';
import { Relation } from 'src/app/graph/nodes/relation';

export class SystemViewNode extends ViewNode {
    addChildren(child: string) {
        this.edgeList.push(new Relation(child))
    }

}