"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var InsertOpsConverter_1 = require("./InsertOpsConverter");
var OpToHtmlConverter_1 = require("./OpToHtmlConverter");
var Grouper_1 = require("./grouper/Grouper");
var group_types_1 = require("./grouper/group-types");
var ListNester_1 = require("./grouper/ListNester");
var funcs_html_1 = require("./funcs-html");
var obj = __importStar(require("./helpers/object"));
var value_types_1 = require("./value-types");
var TableGrouper_1 = require("./grouper/TableGrouper");
var BrTag = '<br/>';
var QuillDeltaToHtmlConverter = (function () {
    function QuillDeltaToHtmlConverter(deltaOps, options) {
        this.rawDeltaOps = [];
        this.callbacks = {};
        this.options = obj.assign({
            paragraphTag: 'p',
            encodeHtml: true,
            classPrefix: 'ql',
            inlineStyles: false,
            multiLineBlockquote: true,
            multiLineHeader: true,
            multiLineCodeblock: true,
            multiLineParagraph: true,
            multiLineCustomBlock: true,
            allowBackgroundClasses: false,
            linkTarget: '_blank',
        }, options, {
            orderedListTag: 'ol',
            bulletListTag: 'ul',
            listItemTag: 'li',
        });
        var inlineStyles;
        if (!this.options.inlineStyles) {
            inlineStyles = undefined;
        }
        else if (typeof this.options.inlineStyles === 'object') {
            inlineStyles = this.options.inlineStyles;
        }
        else {
            inlineStyles = {};
        }
        this.converterOptions = {
            encodeHtml: this.options.encodeHtml,
            classPrefix: this.options.classPrefix,
            inlineStyles: inlineStyles,
            listItemTag: this.options.listItemTag,
            paragraphTag: this.options.paragraphTag,
            linkRel: this.options.linkRel,
            linkTarget: this.options.linkTarget,
            allowBackgroundClasses: this.options.allowBackgroundClasses,
            customTag: this.options.customTag,
            customTagAttributes: this.options.customTagAttributes,
            customCssClasses: this.options.customCssClasses,
            customCssStyles: this.options.customCssStyles,
        };
        this.rawDeltaOps = deltaOps;
    }
    QuillDeltaToHtmlConverter.prototype._getListTag = function (op) {
        return op.isOrderedList()
            ? this.options.orderedListTag + ''
            : op.isBulletList()
                ? this.options.bulletListTag + ''
                : op.isCheckedList()
                    ? this.options.bulletListTag + ''
                    : op.isUncheckedList()
                        ? this.options.bulletListTag + ''
                        : '';
    };
    QuillDeltaToHtmlConverter.prototype.getGroupedOps = function () {
        var deltaOps = InsertOpsConverter_1.InsertOpsConverter.convert(this.rawDeltaOps, this.options);
        var pairedOps = Grouper_1.Grouper.pairOpsWithTheirBlock(deltaOps);
        var groupedSameStyleBlocks = Grouper_1.Grouper.groupConsecutiveSameStyleBlocks(pairedOps, {
            blockquotes: !!this.options.multiLineBlockquote,
            header: !!this.options.multiLineHeader,
            codeBlocks: !!this.options.multiLineCodeblock,
            customBlocks: !!this.options.multiLineCustomBlock,
        });
        var groupedOps = Grouper_1.Grouper.reduceConsecutiveSameStyleBlocksToOne(groupedSameStyleBlocks);
        var listNester = new ListNester_1.ListNester();
        groupedOps = listNester.nest(groupedOps);
        var tableGrouper = new TableGrouper_1.TableGrouper();
        return tableGrouper.group(groupedOps);
    };
    QuillDeltaToHtmlConverter.prototype.convert = function () {
        var _this = this;
        var groups = this.getGroupedOps();
        return groups
            .map(function (group) {
            if (group instanceof group_types_1.ListGroup) {
                return _this._renderWithCallbacks(value_types_1.GroupType.List, group, function () {
                    return _this._renderList(group);
                });
            }
            else if (group instanceof group_types_1.TableGroup) {
                return _this._renderWithCallbacks(value_types_1.GroupType.TableCellLine, group, function () {
                    return _this._renderTable(group);
                });
            }
            else if (group instanceof group_types_1.BlockGroup) {
                var g = group;
                return _this._renderWithCallbacks(value_types_1.GroupType.Block, group, function () {
                    return _this._renderBlock(g.op, g.ops);
                });
            }
            else if (group instanceof group_types_1.BlotBlock) {
                return _this._renderCustom(group.op, null);
            }
            else if (group instanceof group_types_1.VideoItem) {
                return _this._renderWithCallbacks(value_types_1.GroupType.Video, group, function () {
                    var g = group;
                    var converter = new OpToHtmlConverter_1.OpToHtmlConverter(g.op, _this.converterOptions);
                    return converter.getHtml();
                });
            }
            else {
                return _this._renderWithCallbacks(value_types_1.GroupType.InlineGroup, group, function () {
                    return _this._renderInlines(group.ops, true);
                });
            }
        })
            .join('');
    };
    QuillDeltaToHtmlConverter.prototype._renderWithCallbacks = function (groupType, group, myRenderFn) {
        var html = '';
        var beforeCb = this.callbacks['beforeRender_cb'];
        html =
            typeof beforeCb === 'function'
                ? beforeCb.apply(null, [groupType, group])
                : '';
        if (!html) {
            html = myRenderFn();
        }
        var afterCb = this.callbacks['afterRender_cb'];
        html =
            typeof afterCb === 'function'
                ? afterCb.apply(null, [groupType, html])
                : html;
        return html;
    };
    QuillDeltaToHtmlConverter.prototype._renderList = function (list) {
        var _this = this;
        var firstItem = list.items[0];
        var attrsOfList = !!list.headOp
            ? [
                { key: 'data-row', value: list.headOp.attributes.row },
                { key: 'data-cell', value: list.headOp.attributes.cell },
                { key: 'data-rowspan', value: list.headOp.attributes.rowspan },
                { key: 'data-colspan', value: list.headOp.attributes.colspan },
                { key: 'data-list', value: list.headOp.attributes.list.list },
            ]
            : [];
        return (funcs_html_1.makeStartTag(this._getListTag(firstItem.item.op), attrsOfList) +
            list.items.map(function (li) { return _this._renderListItem(li); }).join('') +
            funcs_html_1.makeEndTag(this._getListTag(firstItem.item.op)));
    };
    QuillDeltaToHtmlConverter.prototype._renderListItem = function (li) {
        li.item.op.attributes.indent = 0;
        if (li.item.op.attributes.cell) {
            var userCustomTagAttrs_1 = this.converterOptions.customTagAttributes;
            this.converterOptions.customTagAttributes = function (param) {
                var userAttrs = typeof userCustomTagAttrs_1 === 'function'
                    ? userCustomTagAttrs_1(param)
                    : {};
                return Object.assign({}, userAttrs, {
                    'data-row': li.item.op.attributes.row,
                    'data-cell': li.item.op.attributes.cell,
                    'data-rowspan': li.item.op.attributes.rowspan,
                    'data-colspan': li.item.op.attributes.colspan,
                });
            };
        }
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(li.item.op, this.converterOptions);
        var parts = converter.getHtmlParts();
        var liElementsHtml = this._renderInlines(li.item.ops, false);
        return (parts.openingTag +
            liElementsHtml +
            (li.innerList ? this._renderList(li.innerList) : '') +
            parts.closingTag);
    };
    QuillDeltaToHtmlConverter.prototype._renderTable = function (table) {
        var _this = this;
        var tableColGroup = table.colGroup;
        var tableWidth = 0;
        if (tableColGroup && tableColGroup.cols) {
            tableWidth = tableColGroup.cols.reduce(function (result, col) {
                if (col.item.op.attributes['table-col']) {
                    result += parseInt(col.item.op.attributes['table-col'].width || '0', 10);
                }
                return result;
            }, 0);
        }
        return (funcs_html_1.makeStartTag('div', [{ key: 'class', value: 'clickup-table-view' }]) +
            funcs_html_1.makeStartTag('table', [
                { key: 'class', value: 'clickup-table' },
                { key: 'style', value: !!tableWidth ? "width: " + tableWidth + "px" : '' },
            ]) +
            funcs_html_1.makeStartTag('colgroup') +
            tableColGroup.cols
                .map(function (col) { return _this._renderTableCol(col); })
                .join('') +
            funcs_html_1.makeEndTag('colgroup') +
            funcs_html_1.makeStartTag('tbody') +
            table.rows.map(function (row) { return _this._renderTableRow(row); }).join('') +
            funcs_html_1.makeEndTag('tbody') +
            funcs_html_1.makeEndTag('table') +
            funcs_html_1.makeEndTag('div'));
    };
    QuillDeltaToHtmlConverter.prototype._renderTableCol = function (col) {
        var colWidth;
        if (col.item.op.attributes['table-col']) {
            colWidth = col.item.op.attributes['table-col'].width || '0';
        }
        return funcs_html_1.makeStartTag('col', [{ key: 'width', value: colWidth }]);
    };
    QuillDeltaToHtmlConverter.prototype._renderTableRow = function (row) {
        var _this = this;
        return (funcs_html_1.makeStartTag('tr', [{ key: 'data-row', value: row.row }]) +
            row.cells.map(function (cell) { return _this._renderTableCell(cell); }).join('') +
            funcs_html_1.makeEndTag('tr'));
    };
    QuillDeltaToHtmlConverter.prototype._renderTableCell = function (cell) {
        var _this = this;
        return (funcs_html_1.makeStartTag('td', [
            { key: 'data-row', value: cell.attrs.row },
            { key: 'rowspan', value: cell.attrs.rowspan },
            { key: 'colspan', value: cell.attrs.colspan },
        ]) +
            cell.lines
                .map(function (item) {
                return item instanceof group_types_1.TableCellLine
                    ? _this._renderTableCellLine(item)
                    : _this._renderList(item);
            })
                .join('') +
            funcs_html_1.makeEndTag('td'));
    };
    QuillDeltaToHtmlConverter.prototype._renderTableCellLine = function (line) {
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(line.item.op, this.converterOptions);
        var parts = converter.getHtmlParts();
        var cellElementsHtml = this._renderInlines(line.item.ops, false);
        return (funcs_html_1.makeStartTag('p', [
            { key: 'class', value: 'qlbt-cell-line' },
            { key: 'data-row', value: line.attrs.row },
            { key: 'data-cell', value: line.attrs.cell },
            { key: 'data-rowspan', value: line.attrs.rowspan },
            { key: 'data-colspan', value: line.attrs.colspan },
        ]) +
            parts.openingTag +
            cellElementsHtml +
            parts.closingTag +
            funcs_html_1.makeEndTag('p'));
    };
    QuillDeltaToHtmlConverter.prototype._renderBlock = function (bop, ops) {
        var _this = this;
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(bop, this.converterOptions);
        var htmlParts = converter.getHtmlParts();
        if (bop.isCodeBlock()) {
            return (htmlParts.openingTag +
                funcs_html_1.encodeHtml(ops
                    .map(function (iop) {
                    return iop.isCustomEmbed()
                        ? _this._renderCustom(iop, bop)
                        : iop.insert.value;
                })
                    .join('')) +
                htmlParts.closingTag);
        }
        var inlines = ops.map(function (op) { return _this._renderInline(op, bop); }).join('');
        return htmlParts.openingTag + (inlines || BrTag) + htmlParts.closingTag;
    };
    QuillDeltaToHtmlConverter.prototype._renderInlines = function (ops, isInlineGroup) {
        var _this = this;
        if (isInlineGroup === void 0) { isInlineGroup = true; }
        var opsLen = ops.length - 1;
        var html = ops
            .map(function (op, i) {
            if (i > 0 && i === opsLen && op.isJustNewline()) {
                return '';
            }
            return _this._renderInline(op, null);
        })
            .join('');
        if (!isInlineGroup) {
            return html;
        }
        var startParaTag = funcs_html_1.makeStartTag(this.options.paragraphTag);
        var endParaTag = funcs_html_1.makeEndTag(this.options.paragraphTag);
        if (html === BrTag || this.options.multiLineParagraph) {
            return startParaTag + html + endParaTag;
        }
        return (startParaTag +
            html
                .split(BrTag)
                .map(function (v) {
                return v === '' ? BrTag : v;
            })
                .join(endParaTag + startParaTag) +
            endParaTag);
    };
    QuillDeltaToHtmlConverter.prototype._renderInline = function (op, contextOp) {
        if (op.isCustomEmbed()) {
            return this._renderCustom(op, contextOp);
        }
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(op, this.converterOptions);
        return converter.getHtml().replace(/\n/g, BrTag);
    };
    QuillDeltaToHtmlConverter.prototype._renderCustom = function (op, contextOp) {
        var renderCb = this.callbacks['renderCustomOp_cb'];
        if (typeof renderCb === 'function') {
            return renderCb.apply(null, [op, contextOp]);
        }
        return '';
    };
    QuillDeltaToHtmlConverter.prototype.beforeRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['beforeRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.afterRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['afterRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.renderCustomWith = function (cb) {
        this.callbacks['renderCustomOp_cb'] = cb;
    };
    return QuillDeltaToHtmlConverter;
}());
exports.QuillDeltaToHtmlConverter = QuillDeltaToHtmlConverter;
