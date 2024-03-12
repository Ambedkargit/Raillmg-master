import { Component, OnInit } from '@angular/core';
import { event } from 'jquery';
import * as XLSX from 'xlsx';
import { HotTableModule, HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../../app.service';
import { localStorageService } from '../../../shared/service/local-storage.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { DateTime } from 'luxon';
import { IMachineRoll } from '../../../shared/model/machineRoll.model';
import { IUser } from '../../../shared/model/user.model';
import { hotSettings } from '../../../shared/constants/hotSettings';

@Component({
  selector: 'app-machine-upload-file',
  standalone: true,
  imports: [HotTableModule, FormsModule],
  templateUrl: './machine-upload-file.component.html',
  styleUrl: './machine-upload-file.component.css',
})
export class MachineUploadFileComponent implements OnInit {
  department = '';
  dataSet = [];
  jsonData = [];
  userData: IUser;
  private hotRegisterer = new HotTableRegisterer();
  id = 'hotInstancePre';
  colHeader = [];
  hotSettings: Handsontable.GridSettings = {
    className: 'htCenter htMiddle',
    columnHeaderHeight: 40,
    rowHeights: 30,
    comments: true,
    width: '100%',
    height: '35vh',
    viewportColumnRenderingOffset: 40,
    viewportRowRenderingOffset: 'auto',
    allowRemoveColumn: true,
    allowInsertColumn: false,
    allowInsertRow: false,
    allowRemoveRow: true,
    contextMenu: true,
    colWidths: '150',
    multiColumnSorting: true,
    manualColumnResize: true,
    filters: true,
    manualColumnMove: true,
    rowHeaders: true,
    dropdownMenu: [
      'remove_col',
      'remove_row',
      'clear_column',
      'undo',
      'redo',
      'filter_by_value',
      'filter_operators',
      'filter_action_bar',
    ],
  };

  xlToMngKeys = {
    BOARD: 'board',
    SECTION: 'section',
    'KM/LINE': 'lineNo',
    'MACHINE TYPE & NO.': 'machine',
    'DISCONNECTION DEMAND HOURS': 'dmd_duration',
    'BLOCK DEMAND HOURS': 'dmd_duration',
    QUANTUM: 'quantum',
    'DEPUTED SUPERVISOR': 'deputedSupervisor',
    RESOURCES: 'resources',
    CREW: 'crew',
    LOCO: 'loco',
    'TYPE OF WORK': 'typeOfWork',
    'WHETHER NI WORK/PNI WORK OR NON-NI WORK': 'ni',
    YARD: 'yard',
    'REMARKS IF ANY': 'remarks',
    'APPROVAL REQUIRED OR NOT': 'approval',
    'S&T STAFF REQUIRED (YES/NO)': 's_tStaff',
    'TPC STAFF REQUIRED (YES/NO)': 'tpcStaff',
    'POINT/BPAC/OTHERS': 'point',
    'TOWER WAGON/MATERIAL TRAIN': 'tower',
  };

  constructor(
    private service: AppService,
    private toastService: ToastService,
    private ls: localStorageService
  ) {}

  ngOnInit(): void {
    this.userData = this.ls.getUser();
  }

  onFileUpload(e) {
    let wb = null;
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onload = (event) => {
      const hot = this.hotRegisterer.getInstance(this.id);
      const data = reader.result;
      wb = XLSX.read(data, { type: 'binary', raw: false });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      this.jsonData = XLSX.utils.sheet_to_json(ws, { raw: false });
      this.colHeader = Object.keys(this.jsonData[0]);

      hot.updateData(this.jsonData);
    };

    reader.readAsBinaryString(file);
  }

  onSubmit() {
    this.dataSet = this.jsonData.map((item) => {
      let modData = {} as IMachineRoll;
      modData.department = this.department;
      modData.createdAt = new Date().toISOString();
      modData.createdBy = this.userData.username;
      modData.updatedAt = new Date().toISOString();
      modData.updatedBy = this.userData.username;
      modData.logs = [];
      for (let key of Object.keys(item)) {
        if (!item[key]) continue;

        let upperKey = key.trim().toUpperCase();
        if (upperKey === 'AVAILABLE SLOT') {
          let splitSlot = item['AVAILABLE SLOT'].split(' ');

          const startTime = DateTime.fromFormat(splitSlot[1], 'HH:mm');
          const endTime = DateTime.fromFormat(splitSlot[3], 'HH:mm');
          const timeDifferenceInMinutes = endTime.diff(
            startTime,
            'minutes'
          ).minutes;

          modData.date = splitSlot[0];
          modData.avl_start = splitSlot[1];
          modData.avl_end = splitSlot[3];
          modData.avl_duration = timeDifferenceInMinutes;
        } else {
          if (this.xlToMngKeys[upperKey] !== undefined)
            modData[this.xlToMngKeys[upperKey]] = item[key];
        }
      }
      return modData;
    });

    if (!this.dataSet.length) {
      this.toastService.showWarning('Please upload xlsx file');
    } else {
      this.service
        .addRailDetails('machineRolls', this.dataSet)
        .subscribe(() => {
          this.toastService.showSuccess('successfully submitted');
          this.onDelete();
        });
    }
    console.log('🚀 ~ this.dataSet:', this.dataSet);
  }

  onDelete() {
    this.department = '';
    const hot = this.hotRegisterer.getInstance(this.id);
    this.dataSet = [];
    this.jsonData = [];
    hot.updateData(this.dataSet);
  }
}
