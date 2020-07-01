import { NewLine, ListType, DataType } from './value-types';
import { IOpAttributes } from './OpAttributeSanitizer';
import { InsertData, InsertDataCustom, InsertDataQuill } from './InsertData';
import isEqual from 'lodash.isequal';

class DeltaInsertOp {
  readonly insert: InsertData;
  readonly attributes: IOpAttributes;

  constructor(insertVal: InsertData | string, attrs?: IOpAttributes) {
    if (typeof insertVal === 'string') {
      insertVal = new InsertDataQuill(DataType.Text, insertVal + '');
    }
    this.insert = insertVal;
    this.attributes = attrs || {};
  }

  static createNewLineOp() {
    return new DeltaInsertOp(NewLine);
  }

  isContainerBlock() {
    return (
      this.isBlockquote() ||
      this.isList() ||
      this.isTableCellLine() ||
      this.isTableCol() ||
      this.isCodeBlock() ||
      this.isHeader() ||
      this.isBlockAttribute() ||
      this.isCustomTextBlock()
    );
  }

  isBlockAttribute() {
    const attrs = this.attributes;
    return !!(attrs.align || attrs.direction || attrs.indent);
  }

  isBlockquote(): boolean {
    return !!this.attributes.blockquote;
  }

  isHeader(): boolean {
    return !!this.attributes.header;
  }

  isTableCellLine(): boolean {
    return !!this.attributes['table-cell-line'];
  }

  isTableCol(): boolean {
    return !!this.attributes['table-col'];
  }

  isSameHeaderAs(op: DeltaInsertOp): boolean {
    return op.attributes.header === this.attributes.header && this.isHeader();
  }

  // adi: alignment direction indentation
  hasSameAdiAs(op: DeltaInsertOp) {
    return (
      this.attributes.align === op.attributes.align &&
      this.attributes.direction === op.attributes.direction &&
      this.attributes.indent === op.attributes.indent
    );
  }

  hasSameIndentationAs(op: DeltaInsertOp) {
    return this.attributes.indent === op.attributes.indent;
  }

  hasSameAttr(op: DeltaInsertOp) {
    return isEqual(this.attributes, op.attributes);
  }

  hasHigherIndentThan(op: DeltaInsertOp) {
    return (
      (Number(this.attributes.indent) || 0) >
      (Number(op.attributes.indent) || 0)
    );
  }

  isInline() {
    return !(
      this.isContainerBlock() ||
      this.isVideo() ||
      this.isCustomEmbedBlock()
    );
  }

  isCodeBlock() {
    return !!this.attributes['code-block'];
  }

  hasSameLangAs(op: DeltaInsertOp) {
    return this.attributes['code-block'] === op.attributes['code-block'];
  }

  isJustNewline() {
    return this.insert.value === NewLine;
  }

  isList() {
    return (
      this.isOrderedList() ||
      this.isBulletList() ||
      this.isCheckedList() ||
      this.isUncheckedList()
    );
  }

  isOrderedList() {
    return (
      !!this.attributes.list && this.attributes.list!.list === ListType.Ordered
    );
  }

  isBulletList() {
    return (
      !!this.attributes.list && this.attributes.list!.list === ListType.Bullet
    );
  }

  isCheckedList() {
    return (
      !!this.attributes.list && this.attributes.list!.list === ListType.Checked
    );
  }

  isUncheckedList() {
    return (
      !!this.attributes.list &&
      this.attributes.list!.list === ListType.Unchecked
    );
  }

  isACheckList() {
    return (
      !!this.attributes.list &&
      (this.attributes.list!.list == ListType.Unchecked ||
        this.attributes.list!.list === ListType.Checked)
    );
  }

  isSameListAs(op: DeltaInsertOp): boolean {
    return (
      !!op.attributes.list &&
      (this.attributes.list!.list === op.attributes.list!.list ||
        (op.isACheckList() && this.isACheckList()))
    );
  }

  isSameTableCellAs(op: DeltaInsertOp): boolean {
    return (
      (!!op.isTableCellLine() &&
        this.isTableCellLine() &&
        !!this.attributes['table-cell-line'] &&
        !!op.attributes['table-cell-line'] &&
        this.attributes['table-cell-line']!.cell ===
          op.attributes['table-cell-line']!.cell) ||
      (op.isList() &&
        this.isTableCellLine() &&
        !!this.attributes['table-cell-line'] &&
        !!op.attributes['list'] &&
        this.attributes['table-cell-line']!.cell ===
          op.attributes['list']!.cell) ||
      (op.isTableCellLine() &&
        this.isList() &&
        !!op.attributes['table-cell-line'] &&
        !!this.attributes['list'] &&
        op.attributes['table-cell-line']!.cell ===
          this.attributes['list']!.cell) ||
      (op.isList() &&
        this.isList() &&
        !!this.attributes['list'] &&
        !!op.attributes['list'] &&
        this.attributes['list']!.cell === op.attributes['list']!.cell)
    );
  }

  isText() {
    return this.insert.type === DataType.Text;
  }

  isImage() {
    return this.insert.type === DataType.Image;
  }

  isFormula() {
    return this.insert.type === DataType.Formula;
  }

  isVideo() {
    return this.insert.type === DataType.Video;
  }

  isLink() {
    return this.isText() && !!this.attributes.link;
  }

  isCustomEmbed() {
    return this.insert instanceof InsertDataCustom;
  }

  isCustomEmbedBlock() {
    return this.isCustomEmbed() && !!this.attributes.renderAsBlock;
  }

  isCustomTextBlock() {
    return this.isText() && !!this.attributes.renderAsBlock;
  }

  isMentions() {
    return this.isText() && !!this.attributes.mentions;
  }
}

export { DeltaInsertOp };
