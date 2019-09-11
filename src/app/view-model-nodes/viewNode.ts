import { Relation } from '../graph/nodes/relation';
import { Node } from '../graph/nodes/nodes';
import { CellType } from '../graph/nodeProps/optionStrings';

export abstract class ViewNode {
    id: string
    parent?: string
    type?: string
    props: any
    edgeList?: any
    edgeIfEmpty?: any
    tableView?: TableView

    abstract addChildren(child: string, error:boolean);

    public parseAsrOptions(options: string) {
        let opt = options.split('&')
    }
}

export class RowType {
  name: CellType
  value: CellType

  constructor(type: CellType) {
      this.name = CellType.SPAN
      this.value = type
  }

  public static getInstance(type: CellType): RowType {
      return new RowType(type)
  }
}



export class TableView {
  displayedColumns: string[]
  columnsData: ColumsData[] = []
}

export class ColumsData {
  columnId: string
  columnName: string

  constructor(id: string, name: string) {
      this.columnId = id
      this.columnName = name
  }
}
