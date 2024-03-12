import Handsontable from 'handsontable';
import { columns } from './table-columns';

export const hotSettings: Handsontable.GridSettings = {
  className: 'htCenter htMiddle',
  rowHeaders: true,
  columns: columns,
  columnHeaderHeight: 30,
  multiColumnSorting: true,
  manualColumnResize: true,
  filters: true,
  manualColumnMove: true,
  rowHeights: 30,
  comments: true,
  width: '100%',
  height: '100%',
  viewportColumnRenderingOffset: 40,
  viewportRowRenderingOffset: 'auto',
  dropdownMenu: ['filter_by_value', 'filter_operators', 'filter_action_bar'],
  hiddenColumns: {
    columns: [0],
    indicators: false,
  },
  // cells: function (row, col) {
  //   return {
  //     // className: row % 2 == 0 ? 'evenCell' : 'oddCell',
  //   };
  // },
};
