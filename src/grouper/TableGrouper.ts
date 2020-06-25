import {
  TDataGroup,
  TableGroup,
  TableColGroup,
  TableCol,
  BlockGroup,
  TableRow,
  TableCell,
  TableCellLine,
} from './group-types';
import { groupConsecutiveElementsWhile } from '../helpers/array';
import { isArray } from 'util';

export class TableGrouper {
  group(groups: TDataGroup[]): TDataGroup[] {
    var tableColBlocked = this.convertTableColBlocksToTableColGroup(groups);
    var tableBlocked = this.convertTableBlocksToTableGroups(tableColBlocked);
    return tableBlocked;
  }

  private convertTableBlocksToTableGroups(
    items: TDataGroup[]
  ): Array<TDataGroup> {
    var grouped = groupConsecutiveElementsWhile(
      items,
      (g: TDataGroup, gPrev: TDataGroup) => {
        return (
          g instanceof BlockGroup &&
          gPrev instanceof BlockGroup &&
          g.op.isTableCellLine() &&
          gPrev.op.isTableCellLine()
        );
      }
    );

    let tableColGroup: TableColGroup;
    return grouped.reduce(
      (result: TDataGroup[], item: TDataGroup | BlockGroup[]) => {
        if (!Array.isArray(item)) {
          if (item instanceof BlockGroup && item.op.isTableCellLine()) {
            result.push(
              new TableGroup(
                [
                  new TableRow(
                    [
                      new TableCell(
                        [new TableCellLine(item)],
                        item.op.attributes
                      ),
                    ],
                    item.op.attributes.row
                  ),
                ],
                new TableColGroup([new TableCol(item)])
              )
            );
          } else if (item instanceof TableColGroup) {
            tableColGroup = item;
          } else {
            result.push(item);
          }

          return result;
        }

        result.push(
          new TableGroup(
            this.convertTableBlocksToTableRows(
              this.convertTableBlocksToTableCells(item)
            ),
            tableColGroup
          )
        );
        return result;
      },
      []
    );
  }

  private convertTableBlocksToTableRows(items: TDataGroup[]): TableRow[] {
    var grouped = groupConsecutiveElementsWhile(
      items,
      (g: TDataGroup, gPrev: TDataGroup) => {
        return (
          g instanceof TableCell &&
          gPrev instanceof TableCell &&
          (g.attrs ? g.attrs.row : undefined) ===
            (gPrev.attrs ? gPrev.attrs.row : undefined)
        );
      }
    );

    return grouped.map((item: TableCell | TableCell[]) => {
      let row;
      if (isArray(item)) {
        const firstCell = item[0];
        if (firstCell) {
          row = firstCell.attrs ? firstCell.attrs.row : undefined;
        }
      } else {
        if (item.attrs) {
          row = item.attrs.row;
        } else {
          row = undefined;
        }
      }

      return new TableRow(
        Array.isArray(item) ? item.map((it) => it) : [item],
        row
      );
    });
  }

  private convertTableBlocksToTableCells(items: TDataGroup[]): TableCell[] {
    var grouped = groupConsecutiveElementsWhile(
      items,
      (g: TDataGroup, gPrev: TDataGroup) => {
        return (
          g instanceof BlockGroup &&
          gPrev instanceof BlockGroup &&
          g.op.isTableCellLine() &&
          gPrev.op.isTableCellLine() &&
          g.op.isSameTableCellAs(gPrev.op)
        );
      }
    );

    return grouped.map((item: BlockGroup | BlockGroup[]) => {
      const attrs = isArray(item) ? item[0].op.attributes : item.op.attributes;
      return new TableCell(
        Array.isArray(item)
          ? item.map((it) => new TableCellLine(it))
          : [new TableCellLine(item)],
        attrs
      );
    });
  }

  private convertTableColBlocksToTableColGroup(
    items: TDataGroup[]
  ): TDataGroup[] {
    var grouped = groupConsecutiveElementsWhile(
      items,
      (g: TDataGroup, gPrev: TDataGroup) => {
        return (
          g instanceof BlockGroup &&
          gPrev instanceof BlockGroup &&
          g.op.isTableCol() &&
          gPrev.op.isTableCol()
        );
      }
    );

    return grouped.map((item: BlockGroup | BlockGroup[]) => {
      if (!Array.isArray(item)) {
        if (item instanceof BlockGroup && item.op.isTableCol()) {
          return new TableColGroup([new TableCol(item)]);
        }
        return item;
      }

      return new TableColGroup(
        isArray(item)
          ? item.map((it) => new TableCol(it))
          : [new TableCol(item)]
      );
    });
  }
}
