import { Component, Input, OnInit } from '@angular/core';
import { HotTableModule, HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { DateTime } from 'luxon';
import { AppService } from '../../../app.service';
import { hotSettings } from '../../../shared/constants/hotSettings';
import { ILog, IMachineRoll } from '../../../shared/model/machineRoll.model';
import { IUser } from '../../../shared/model/user.model';
import { localStorageService } from '../../../shared/service/local-storage.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
// import { CautionRender } from '../../../shared/constants/table-columns';

@Component({
  selector: 'app-verify-demand-table',
  standalone: true,
  imports: [CommonModule, HotTableModule],
  templateUrl: './verify-demand-table.component.html',
  styleUrl: './verify-demand-table.component.css',
})
export class VerifyDemandTableComponent implements OnInit {
  @Input() domain: any = '';
  userData: IUser;
  startDate: any;
  endDate: any;
  dataSet = [];

  private hotRegisterer = new HotTableRegisterer();
  id = 'hotInstance_';

  columns = [
    { data: '_id', title: '_id' },
    { data: 'date', title: 'DATE', width: 73 },
    {
      data: 'Avl_status',
      title: 'AVAIL STATUS',
      type: 'checkbox',
      defaultData: true,
      width: 130,
    },
    {
      data: 'Dmd_remarks',
      title: 'DEMAND REMARKS',
      width: 130,
    },
    {
      data: 'status',
      title: ' APPROVE STATUS',
      type: 'select',
      selectOptions: ['Accept', 'Reject', 'CHOOSE STATUS'],
      width: 130,
    },
    {
      data: 'Apl_remarks',
      title: 'APPROVAL REMARKS',
      width: 153,
    },

   
    { data: 'department', title: 'DEPARTMENT', width: 110 },
    {
      data: 'board',
      title: 'BOARD',
      type: 'select',
      // selectOptions: ['BG1', 'BG2', 'BG3', 'BG4', 'BG5'],
      width: 73,
    },
    { data: 'section', title: 'SECTION', width: 80 },
    {
      data: 'direction',
      title: 'DIRECTION',
      type: 'text',
      // selectOptions: ['UP', 'DN', 'BOTH'],
      width: 90,
    },
    {
      data: 'stationFrom',
      title: 'STATION FROM',
      type: 'text',
      // selectOptions: stationList,
      width: 120,
    },
    {
      data: 'stationTo',
      title: 'STATION TO',
      type: 'text',
      // selectOptions: stationList,
      width: 100,
    },
    { data: 'km', title: 'KILOMETER', width: 80 },
    { data: 'lineNo', title: 'LINE', width: 60 },
    { data: 'typeOfWork', title: 'TYPE OF WORK', width: 120 },
    { data: 'machine', title: 'MACHINE TYPE', width: 120 },
    { data: 'quantum', title: 'QUANTUM', width: 120 },
    { data: 'series', title: 'SERIES', width: 80 },
    { data: 'avl_start', title: 'SLOT START', width: 100 },
    { data: 'avl_end', title: 'SLOT END', width: 90 },
    { data: 'avl_duration', title: 'AVL DUR...', width: 100 },
    { data: 'dmd_duration', title: 'DMD DUR...', width: 100 },
    { data: 'loco', title: 'LOCO', width: 70 },
    { data: 'crew', title: 'CREW', width: 70 },
    { data: 's_tStaff', title: 'S&T STAFF', width: 90 },
    { data: 'tpcStaff', title: 'TPC STAFF', width: 90 },
    { data: 'remarks', title: ' REMARKS', width: 90 },
  //  {
  //    data: 'burst',
  //    title: 'BLOCK DETAILS',
  //    type: 'select',
  //    selectOptions: ['BLOCK BURST', 'Block Ended on Time', 'BLOCK EXTENDED'],
  //    width: 120,
  //  },
   
   {
    data: 'integrates',
    title: 'INTEGRATED',
    width: 230,
    editor: false,
    readOnly: true,
  },
    // {
    //   data: 'caution',
    //   title: 'CAUTION',
    //   width: 160,
    //   renderer: CautionRender,
    //   editor: false,
    //   readOnly: true,
    // },
    // {
    //   data: 'cautions',
    //   title: 'CAUTION',
    //   width: 160,
    //   editor: false,
    //   readOnly: true,
    // },
    {
      data: 'cautionLength',
      title: 'CAUTION LENGTH',
      width: 150,
    },
    {
        data: 'cautionTdc',
        title: 'CAUTION TDC',
        width: 120,
      },
    {
      data: 'cautionSpeed',
      title: 'CAUTION SPEED',
      width: 120,
    },
    {
      data: 'cautionTimeLoss',
      title: 'TIME LOSS',
      width: 120, 
    },
    {
      data: 'grant_status',
      title: 'GRANT STATUS',
      type: 'select',
      selectOptions: ['Pending', 'Granted', 'Not Granted'],
      width: 120,
    },
    { data: 'time_granted', title: 'TIME GRANTED', width: 120 },
    { data: 'slots', title: 'SLOTS', width: 120 },
    { data: 'output', title: 'OUTPUT', width: 120 },
    { data: 'OPTG_remarks', title: 'OPTG Remarks', width: 120 },
    { data: 'rollfrom', title: 'ROLL FROM', width: 100 },
    {
      data: 'logs',
      title: 'EDIT HISTORY',
      editor: false,
      width: 300,
      renderer: (
        instance: Handsontable.Core,
        TD: HTMLTableCellElement,
        row: number,
        col: number,
        prop: string | number,
        value: ILog[],
        cellProperties: Handsontable.CellProperties
      ) => {
        TD.className = 'wraptext';
        let text = [];
        if (!value?.length) return;
        for (let log of value) {
          text.push(
            `user ${log.updatedBy} modified ${log.field} from ${log.oldValue} to ${log.newValue}.`
          );
        }
        TD.innerHTML = text.join(' | ');
        cellProperties.comment = {
          value: text.join('\n'),
          readOnly: true,
        };
      },
    },
  ];

  hotSettings: Handsontable.GridSettings = {
    ...hotSettings,
    height: '74vh',
    columns: this.columns,
    afterChange: (changes) => {
      changes?.forEach(([row, prop, oldValue, newValue]) => {
        const headerKey = prop as string;
        if (headerKey === 'status' && newValue === 'CHOOSE STATUS') {
          newValue = '';
        }
        const hot = this.hotRegisterer.getInstance(this.id);
        let id = hot.getDataAtRow(row)[0];
        const url = hot.getDataAtRow(row)[37];
        console.log(hot.getDataAtRow(row));
        if (oldValue == newValue || (newValue == '' && oldValue == undefined)) {
          return;
        }
        const data = this.dataSet.find((item) => item._id === id);

        const log = {
          updatedBy: this.userData['username'],
          updatedAt: new Date().toISOString(),
          field: headerKey,
          oldValue,
          newValue,
        };
        
        let payload: Partial<IMachineRoll> = {
          [headerKey]: newValue,
          updatedBy: this.userData['username'],
          updatedAt: new Date().toISOString(),
          logs: [...data.logs, log],
        };
        this.service.updateRailDetails(url, id, payload).subscribe(() => {
          const column = hot.propToCol(headerKey);
          const cell = hot.getCell(row, column as number);
          cell.style.backgroundColor = 'lightblue';
          cell.className = 'updatedCell';
          this.toastService.showSuccess('successfully Updated');
        });
      });
    },
    cells: (row, col, prop) => {
      // let cp = { className: row % 2 == 0 ? 'evenCell' : 'oddCell' };
      if (this.dataSet.length === 0) {
        return;
      }
      let cp = {
        className:
          this.dataSet[row].status == 'Reject'
            ? 'redCell'
            : this.dataSet[row].status == 'Accept'
            ? 'greenCell'
            : '',
      };

      if (
        (prop === 'grant_status' ||
          prop === 'time_granted' ||
          prop === 'remarks' ||
          prop === 'status' ||
          prop === 'burst' ||
          prop === 'Avl_status' ||
          prop === 'OPTG_remarks' ||
          prop === 'output' ||
          prop === 'slots' ||
          prop === 'Apl_remarks' ||
          prop === 'Dmd_remarks') &&
        this.userData.department === 'OPERATING'
      ) {
        cp['readOnly'] = false;
      } else if (
        (prop === 'Avl_status' || prop === 'Dmd_remarks') &&
        this.userData.department === this.dataSet[row]?.department
      ) {
        cp['readOnly'] = false;
      } else {
        cp['readOnly'] = true;
      }
      return cp;
    },
  };

  constructor(
    private service: AppService,
    private toastService: ToastService,
    private ls: localStorageService
  ) {}

  ngOnInit() {
    this.id += this.domain;
    this.userData = this.ls.getUser();
    let fetchUrl = [];
    if (this.domain === 'rolling') {
      fetchUrl = ['machineRolls', 'maintenanceRolls'];
    } else {
      fetchUrl = ['machineNonRolls', 'maintenanceNonRolls'];
    }
    const currentDate = DateTime.now().toFormat('dd/MM/yyyy'); //show current date data
    const nextDate = DateTime.now().plus({ days: 1 }).toFormat('dd/MM/yyyy'); //show previous date data

    Promise.resolve().then(() => {
      for (let url of fetchUrl) {
        this.service.getAllMachineRoll(url).subscribe((data) => {
          data = data.map((item) => {
            if (item.status == undefined || item.status == '') {
              item.status = 'CHOOSE STATUS';
            }


            // Integrate values into 'item.integrates'
            let Itemp = '';
            for (let ele of item.integrated) { 
              Itemp += `BLOCK: ${ele.block !== undefined ? ele.block : '-'} | SECTION: ${ele.section1 !== undefined ? ele.section1 : '-'} | DURATION: ${ele.duration !== undefined ? ele.duration : '-'}\n`;
              }
              item.integrates = Itemp;

            // process caution data
            let cSpeed = '';
            let cLength = '';
            let cTdc = '';
            let cTimeLoss= '';

            for (let ele of item.caution) {
              cLength += `${ele.length}  \n`;
              cSpeed += `${ele.speed}  \n`; 
              cTdc += `${ ele.tdc} \n` ;
              cTimeLoss +=ele.timeloss? `${ ele.timeloss} \n`:''; 
            }

            item.cautionLength = cLength;
            item.cautionSpeed = cSpeed;
            item.cautionTdc = cTdc;
            item.cautionTimeLoss=cTimeLoss;
            return item;
          
          });
          
          data = data.filter(item => item.date === currentDate || item.date === nextDate); //save current & previous date data

          data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); //sorting data as datewise
          
          this.setDataToRoll(data, url);
        });
      }
    });
  }

  onExcelDownload() {
    const hot = this.hotRegisterer.getInstance(this.id);
    const exportPlugin = hot.getPlugin('exportFile');
    const exportedString = exportPlugin.exportAsString('csv', {
      bom: false,
      columnHeaders: true,
      exportHiddenColumns: true,
      exportHiddenRows: true,
      rowDelimiter: '\r\n',
    });

    const jsonData = Papa.parse(exportedString);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dates');
    XLSX.utils.sheet_add_aoa(worksheet, jsonData.data);
    XLSX.writeFile(workbook, 'MachineRolls.xlsx');
    this.toastService.showSuccess('Downloaded Excel file');
  }

  onPdfDownload() {
    const hot = this.hotRegisterer.getInstance(this.id);
    const exportPlugin = hot.getPlugin('exportFile');
    const exportedString = exportPlugin.exportAsString('csv', {
      bom: false,
      columnHeaders: true,
      exportHiddenColumns: true,
      exportHiddenRows: true,
      rowDelimiter: '\r\n',
    
    });
    const workbook = XLSX.utils.book_new();
    const jsonData = Papa.parse(exportedString);
    let dataSet = jsonData.data.map((ele) => {
      ele.shift();
      ele.pop();
      return ele;
    });

    const doc = new jsPDF('p', 'pc', [300, 500]);
    // autoTable(doc, { html: '#table-wrapper' });
    autoTable(doc, {
      head: [dataSet.shift()],
      body: dataSet,
    });
     doc.save('raillmg.pdf');
  
   }


  setDataToRoll(data, rollfrom) {
    const hot1 = this.hotRegisterer.getInstance(this.id);
    data = data.map((ele) => {
      ele['rollfrom'] = rollfrom;
      return ele;
    });
    if (this.userData.department !== 'OPERATING') {
      data = data.filter((item) => {
        return item.department === this.userData.department;
      });
    }
    this.dataSet.push(...data);
    hot1.updateSettings({
      data: this.dataSet,
    });
  }

  selectStartDate(e) {
    this.startDate = DateTime.fromISO(e.target.value);
  }
  selectEndDate(e) {
    this.endDate = DateTime.fromISO(e.target.value);
  }

  filterDataWithDate() {
    if (!this.startDate && !this.endDate) {
      return;
    }
    const hot = this.hotRegisterer.getInstance(this.id);
    const data = this.dataSet.filter((item) => {
      const parsedDate = DateTime.fromFormat(item.date, 'dd/MM/yyyy');
      if (this.startDate <= parsedDate && this.endDate >= parsedDate) {
        return true;
      } else if (
        this.startDate !== undefined &&
        this.startDate <= parsedDate &&
        this.endDate == undefined
      ) {
        return true;
      } else if (
        this.endDate !== undefined &&
        this.endDate >= parsedDate &&
        this.startDate == undefined
      ) {
        return true;
      }
      return false;
    });
    hot.updateData(data);
  }

  ResetDates() {
    const hot = this.hotRegisterer.getInstance(this.id);
    hot.updateData(this.dataSet);
  }
}
