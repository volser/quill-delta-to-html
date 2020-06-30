import { DeltaInsertOp } from './../DeltaInsertOp';
import { IOpAttributes } from './../OpAttributeSanitizer';
declare class InlineGroup {
  readonly ops: DeltaInsertOp[];
  constructor(ops: DeltaInsertOp[]);
}
declare class SingleItem {
  readonly op: DeltaInsertOp;
  constructor(op: DeltaInsertOp);
}
declare class VideoItem extends SingleItem {}
declare class BlotBlock extends SingleItem {}
declare class BlockGroup {
  readonly op: DeltaInsertOp;
  ops: DeltaInsertOp[];
  constructor(op: DeltaInsertOp, ops: DeltaInsertOp[]);
}
declare class ListGroup {
  items: ListItem[];
  readonly headOp: DeltaInsertOp | undefined;
  constructor(items: ListItem[]);
}
declare class ListItem {
  readonly item: BlockGroup;
  innerList: ListGroup | null;
  constructor(item: BlockGroup, innerList?: ListGroup | null);
}
declare class TableGroup {
  rows: TableRow[];
  colGroup: TableColGroup;
  constructor(rows: TableRow[], colGroup: TableColGroup);
}
declare class TableColGroup {
  cols: TableCol[];
  constructor(cols: TableCol[]);
}
declare class TableCol {
  item: BlockGroup;
  constructor(item: BlockGroup);
}
declare class TableRow {
  cells: TableCell[];
  readonly row: string | undefined;
  constructor(cells: TableCell[], row: string | undefined);
}
declare class TableCell {
  lines: (TableCellLine | ListGroup)[];
  readonly attrs: IOpAttributes | undefined;
  constructor(lines: (TableCellLine | ListGroup)[], attributes: IOpAttributes);
}
declare class TableCellLine {
  readonly item: BlockGroup;
  readonly attrs: IOpAttributes | undefined;
  constructor(item: BlockGroup);
}
declare type TDataGroup =
  | VideoItem
  | InlineGroup
  | BlockGroup
  | ListItem
  | ListGroup
  | TableGroup
  | TableColGroup
  | TableCol
  | TableRow
  | TableCell
  | TableCellLine;
export {
  VideoItem,
  BlotBlock,
  InlineGroup,
  BlockGroup,
  ListGroup,
  ListItem,
  TableGroup,
  TableColGroup,
  TableCol,
  TableRow,
  TableCell,
  TableCellLine,
  TDataGroup,
};
