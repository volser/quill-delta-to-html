import 'mocha';
import * as assert from 'assert';

import { DeltaInsertOp } from '../../src/DeltaInsertOp';
import { Grouper } from '../../src/grouper/Grouper';
import { TableGrouper } from '../../src/grouper/TableGrouper';
import {
  TableGroup,
  TableColGroup,
  TableCol,
  BlockGroup,
  TableRow,
  TableCell,
  TableCellLine,
} from '../../src/grouper/group-types';

describe('TableGrouper', function () {
  describe('empty table', function () {
    var ops = [
      new DeltaInsertOp('\n', { 'table-col': { width: '150' } }),
      new DeltaInsertOp('\n', { 'table-col': { width: '150' } }),
      new DeltaInsertOp('\n', { 'table-col': { width: '150' } }),
      new DeltaInsertOp('\n', {
        colspan: '1',
        rowspan: '1',
        row: 'row-1',
        'table-cell-line': {
          cell: 'cell-1',
          row: 'row-1',
          rowspan: '1',
          colspan: '1',
        },
      }),
      new DeltaInsertOp('\n', {
        colspan: '1',
        rowspan: '1',
        row: 'row-1',
        'table-cell-line': {
          cell: 'cell-2',
          row: 'row-1',
          rowspan: '1',
          colspan: '1',
        },
      }),
      new DeltaInsertOp('\n', {
        colspan: '1',
        rowspan: '1',
        row: 'row-1',
        'table-cell-line': {
          cell: 'cell-3',
          row: 'row-1',
          rowspan: '1',
          colspan: '1',
        },
      }),
      new DeltaInsertOp('\n', {
        colspan: '1',
        rowspan: '1',
        row: 'row-2',
        'table-cell-line': {
          cell: 'cell-4',
          row: 'row-2',
          rowspan: '1',
          colspan: '1',
        },
      }),
      new DeltaInsertOp('\n', {
        colspan: '1',
        rowspan: '1',
        row: 'row-2',
        'table-cell-line': {
          cell: 'cell-5',
          row: 'row-2',
          rowspan: '1',
          colspan: '1',
        },
      }),
      new DeltaInsertOp('\n', {
        colspan: '1',
        rowspan: '1',
        row: 'row-2',
        'table-cell-line': {
          cell: 'cell-6',
          row: 'row-2',
          rowspan: '1',
          colspan: '1',
        },
      }),
      new DeltaInsertOp('\n', {
        colspan: '1',
        rowspan: '1',
        row: 'row-3',
        'table-cell-line': {
          cell: 'cell-7',
          row: 'row-3',
          rowspan: '1',
          colspan: '1',
        },
      }),
      new DeltaInsertOp('\n', {
        colspan: '1',
        rowspan: '1',
        row: 'row-3',
        'table-cell-line': {
          cell: 'cell-8',
          row: 'row-3',
          rowspan: '1',
          colspan: '1',
        },
      }),
      new DeltaInsertOp('\n', {
        colspan: '1',
        rowspan: '1',
        row: 'row-3',
        'table-cell-line': {
          cell: 'cell-9',
          row: 'row-3',
          rowspan: '1',
          colspan: '1',
        },
      }),
    ];

    it('should return table with 3 rows and 3 cells', function () {
      var groupsAct = Grouper.pairOpsWithTheirBlock(ops);
      var groupsExp = Grouper.pairOpsWithTheirBlock(ops);
      var tableGrouper = new TableGrouper();
      var act = tableGrouper.group(groupsAct);
      var exp = [
        new TableGroup(
          [
            new TableRow(
              [
                new TableCell(
                  [new TableCellLine(<BlockGroup>groupsExp[3])],
                  ops[3].attributes
                ),
                new TableCell(
                  [new TableCellLine(<BlockGroup>groupsExp[4])],
                  ops[4].attributes
                ),
                new TableCell(
                  [new TableCellLine(<BlockGroup>groupsExp[5])],
                  ops[5].attributes
                ),
              ],
              ops[3].attributes.row
            ),
            new TableRow(
              [
                new TableCell(
                  [new TableCellLine(<BlockGroup>groupsExp[6])],
                  ops[6].attributes
                ),
                new TableCell(
                  [new TableCellLine(<BlockGroup>groupsExp[7])],
                  ops[7].attributes
                ),
                new TableCell(
                  [new TableCellLine(<BlockGroup>groupsExp[8])],
                  ops[8].attributes
                ),
              ],
              ops[6].attributes.row
            ),
            new TableRow(
              [
                new TableCell(
                  [new TableCellLine(<BlockGroup>groupsExp[9])],
                  ops[9].attributes
                ),
                new TableCell(
                  [new TableCellLine(<BlockGroup>groupsExp[10])],
                  ops[10].attributes
                ),
                new TableCell(
                  [new TableCellLine(<BlockGroup>groupsExp[11])],
                  ops[11].attributes
                ),
              ],
              ops[9].attributes.row
            ),
          ],
          new TableColGroup([
            new TableCol(<BlockGroup>groupsExp[0]),
            new TableCol(<BlockGroup>groupsExp[1]),
            new TableCol(<BlockGroup>groupsExp[2]),
          ])
        ),
      ];

      assert.deepEqual(act, exp);
    });
  });

  describe('single 1 row table', function () {
    var ops = [
      new DeltaInsertOp('\n', { 'table-col': { width: '150' } }),
      new DeltaInsertOp('\n', { 'table-col': { width: '150' } }),
      new DeltaInsertOp('cell1'),
      new DeltaInsertOp('\n', {
        colspan: '1',
        rowspan: '1',
        row: 'row-1',
        'table-cell-line': {
          cell: 'cell-1',
          row: 'row-1',
          rowspan: '1',
          colspan: '1',
        },
      }),
      new DeltaInsertOp('cell2'),
      new DeltaInsertOp('\n', {
        colspan: '1',
        rowspan: '1',
        row: 'row-1',
        'table-cell-line': {
          cell: 'cell-2',
          row: 'row-1',
          rowspan: '1',
          colspan: '1',
        },
      }),
    ];

    it('should return table with 1 row', function () {
      var groupsAct = Grouper.pairOpsWithTheirBlock(ops);
      var groupsExp = Grouper.pairOpsWithTheirBlock(ops);
      var tableGrouper = new TableGrouper();
      var act = tableGrouper.group(groupsAct);
      var exp = [
        new TableGroup(
          [
            new TableRow(
              [
                new TableCell(
                  [new TableCellLine(<BlockGroup>groupsExp[2])],
                  ops[3].attributes
                ),
                new TableCell(
                  [new TableCellLine(<BlockGroup>groupsExp[3])],
                  ops[5].attributes
                ),
              ],
              ops[3].attributes.row
            ),
          ],
          new TableColGroup([
            new TableCol(<BlockGroup>groupsExp[0]),
            new TableCol(<BlockGroup>groupsExp[1]),
          ])
        ),
      ];

      assert.deepEqual(act, exp);
    });
  });

  describe('single 1 col table', function () {
    var ops = [
      new DeltaInsertOp('\n', { 'table-col': { width: '150' } }),
      new DeltaInsertOp('cell1'),
      new DeltaInsertOp('\n', {
        colspan: '1',
        rowspan: '1',
        row: 'row-1',
        'table-cell-line': {
          cell: 'cell-1',
          row: 'row-1',
          rowspan: '1',
          colspan: '1',
        },
      }),
      new DeltaInsertOp('cell2'),
      new DeltaInsertOp('\n', {
        colspan: '1',
        rowspan: '1',
        row: 'row-2',
        'table-cell-line': {
          cell: 'cell-2',
          row: 'row-2',
          rowspan: '1',
          colspan: '1',
        },
      }),
    ];

    it('should return table with 1 col', function () {
      var groups = Grouper.pairOpsWithTheirBlock(ops);
      var tableGrouper = new TableGrouper();
      var act = tableGrouper.group(groups);
      var exp = [
        new TableGroup(
          [
            new TableRow(
              [
                new TableCell(
                  [new TableCellLine(<BlockGroup>groups[1])],
                  ops[2].attributes
                ),
              ],
              ops[2].attributes.row
            ),
            new TableRow(
              [
                new TableCell(
                  [new TableCellLine(<BlockGroup>groups[2])],
                  ops[4].attributes
                ),
              ],
              ops[4].attributes.row
            ),
          ],
          new TableColGroup([new TableCol(<BlockGroup>groups[0])])
        ),
      ];

      assert.deepEqual(act, exp);
    });
  });
});
