"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var group_types_1 = require("./group-types");
var array_1 = require("../helpers/array");
var util_1 = require("util");
var TableGrouper = (function () {
    function TableGrouper() {
    }
    TableGrouper.prototype.group = function (groups) {
        var tableColBlocked = this.convertTableColBlocksToTableColGroup(groups);
        var tableBlocked = this.convertTableBlocksToTableGroups(tableColBlocked);
        return tableBlocked;
    };
    TableGrouper.prototype.convertTableBlocksToTableGroups = function (items) {
        var _this = this;
        var grouped = array_1.groupConsecutiveElementsWhile(items, function (g, gPrev) {
            return (g instanceof group_types_1.BlockGroup &&
                gPrev instanceof group_types_1.BlockGroup &&
                g.op.isTableCellLine() &&
                gPrev.op.isTableCellLine());
        });
        var tableColGroup;
        return grouped.reduce(function (result, item) {
            if (!Array.isArray(item)) {
                if (item instanceof group_types_1.BlockGroup && item.op.isTableCellLine()) {
                    result.push(new group_types_1.TableGroup([
                        new group_types_1.TableRow([
                            new group_types_1.TableCell([
                                new group_types_1.TableCellLine(item)
                            ], item.op.attributes)
                        ], item.op.attributes.row)
                    ], new group_types_1.TableColGroup([
                        new group_types_1.TableCol(item)
                    ])));
                }
                else if (item instanceof group_types_1.TableColGroup) {
                    tableColGroup = item;
                }
                else {
                    result.push(item);
                }
                return result;
            }
            result.push(new group_types_1.TableGroup(_this.convertTableBlocksToTableRows(_this.convertTableBlocksToTableCells(item)), tableColGroup));
            return result;
        }, []);
    };
    TableGrouper.prototype.convertTableBlocksToTableRows = function (items) {
        var grouped = array_1.groupConsecutiveElementsWhile(items, function (g, gPrev) {
            return (g instanceof group_types_1.TableCell &&
                gPrev instanceof group_types_1.TableCell &&
                (g.attrs ? g.attrs.row : undefined) === (gPrev.attrs ? gPrev.attrs.row : undefined));
        });
        return grouped.map(function (item) {
            var row;
            if (util_1.isArray(item)) {
                var firstCell = item[0];
                if (firstCell) {
                    row = firstCell.attrs ? firstCell.attrs.row : undefined;
                }
            }
            else {
                if (item.attrs) {
                    row = item.attrs.row;
                }
                else {
                    row = undefined;
                }
            }
            return new group_types_1.TableRow(Array.isArray(item)
                ? item.map(function (it) { return it; })
                : [item], row);
        });
    };
    TableGrouper.prototype.convertTableBlocksToTableCells = function (items) {
        var grouped = array_1.groupConsecutiveElementsWhile(items, function (g, gPrev) {
            return (g instanceof group_types_1.BlockGroup &&
                gPrev instanceof group_types_1.BlockGroup &&
                g.op.isTableCellLine() &&
                gPrev.op.isTableCellLine() &&
                g.op.isSameTableCellAs(gPrev.op));
        });
        return grouped.map(function (item) {
            var attrs = util_1.isArray(item) ? item[0].op.attributes : item.op.attributes;
            return new group_types_1.TableCell(Array.isArray(item)
                ? item.map(function (it) { return new group_types_1.TableCellLine(it); })
                : [new group_types_1.TableCellLine(item)], attrs);
        });
    };
    TableGrouper.prototype.convertTableColBlocksToTableColGroup = function (items) {
        var grouped = array_1.groupConsecutiveElementsWhile(items, function (g, gPrev) {
            return (g instanceof group_types_1.BlockGroup &&
                gPrev instanceof group_types_1.BlockGroup &&
                g.op.isTableCol() &&
                gPrev.op.isTableCol());
        });
        return grouped.map(function (item) {
            if (!Array.isArray(item)) {
                if (item instanceof group_types_1.BlockGroup && item.op.isTableCol()) {
                    return new group_types_1.TableColGroup([new group_types_1.TableCol(item)]);
                }
                return item;
            }
            return new group_types_1.TableColGroup(util_1.isArray(item)
                ? item.map(function (it) { return new group_types_1.TableCol(it); })
                : [new group_types_1.TableCol(item)]);
        });
    };
    return TableGrouper;
}());
exports.TableGrouper = TableGrouper;
