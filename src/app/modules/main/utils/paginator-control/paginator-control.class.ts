import { isMobileMode } from '../window-size/window-size.util';

export class PaginatorControl {
  private readonly _className = 'Paginator';

  private _rowNum: number = 1; // Number of items per page.

  private _rowIndexes: number[] = []; // Row index list.

  itemNum: number = 0; // Total item size.

  firstItemIndex: number = 0; // Item index at first row of the current page.

  pageIndex: number = 0; // Page index of the current page.

  private _pageLinkNum: number = 1; // Number of shown pages.

  //============================================================================
  // Getter / setter.
  //
  get rowNum() {
    return this._rowNum;
  }

  set rowNum(rowNum: number) {
    this._rowNum = rowNum;
    this._rowIndexes = Array(rowNum);
    for (let i = 0; i < rowNum; ++i) {
      this._rowIndexes[i] = i;
    }
  }

  get rowIndexes() {
    return this._rowIndexes;
  }

  get pageLinkNum() {
    return this._pageLinkNum;
  }

  //============================================================================
  // Class methods.
  //
  constructor() {
    // Set page link num.
    this._pageLinkNum = isMobileMode() ? 3 : 9;
  }

  goToFirstPage() {
    this.firstItemIndex = 0;
    this.pageIndex = 0;
  }
}
