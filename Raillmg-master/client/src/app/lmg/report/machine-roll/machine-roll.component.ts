import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../app.service';
import { HotTableModule, HotTableRegisterer } from '@handsontable/angular';
import { registerAllModules } from 'handsontable/registry';
import Handsontable from 'handsontable';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ToastService } from '../../../shared/toast/toast.service';
import { hotSettings } from '../../../shared/constants/hotSettings';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { ConnectService } from '../../../services/connect.service';

registerAllModules();
@Component({
  selector: 'app-machine-roll',
  standalone: true,
  templateUrl: './machine-roll.component.html',
  styleUrl: './machine-roll.component.css',
  imports: [HotTableModule, CommonModule],
})
export class MachineRollComponent implements OnInit {
  private hotRegisterer = new HotTableRegisterer();
  domainData = {
    machineRolls: 'MACHINE ROLLS BLOCK',
    maintenanceRolls: 'MAINTENANCE ROLLS BLOCK',
    machineNonRolls: 'MACHINE OUT OF ROLLING BLOCK',
    maintenanceNonRolls: 'MAINTENANCE OUT OF ROLLING BLOCK',
    'all-rolling': 'ALL-ROLLING BLOCK',
    'all-non-rolling': 'ALL-NON-ROLLING BLOCK',
  };
  id = 'hotInstance';
  dataset: any = [];
  startDate: any;
  endDate: any;
  title: any;
  hotSettings: Handsontable.GridSettings = {
    editor: false,
    readOnly: true,
    ...hotSettings,
  };
 
  constructor(
    private service: AppService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private connect: ConnectService //add extra service
  ) {}

  ngOnInit() {
    this.route.params.subscribe((url) => {
      this.title = url.id;
      let domain = [];
      if (this.title == 'all-rolling') {
        domain = ['machineRolls', 'maintenanceRolls'];
        this.dataset = [];
      } else if (this.title === 'all-non-rolling') {
        domain = ['maintenanceNonRolls', 'machineNonRolls'];
        this.dataset = [];
      } else {
        domain = [this.title];
        this.dataset = [];
      }
      for (let ele of domain) {
        Promise.resolve().then(() => {
          this.service.getAllMachineRoll(ele).subscribe((data) => {
            const hot = this.hotRegisterer.getInstance(this.id);
            data = data.map((item) => {

              // Integrate values into 'item.integrates'
              let Itemp = '';
              for (let ele of item.integrated) { 
              Itemp += `BLOCK: ${ele.block !== undefined ? ele.block : '-'} | SECTION: ${ele.section1 !== undefined ? ele.section1 : '-'} | DURATION: ${ele.duration !== undefined ? ele.duration : '-'}\n`;
              }
              item.integrates = Itemp;

              // Process caution data
              let cSpeed = '';
              let cLength = '';
              let cTdc = '';
              for (let ele of item.caution) {
                cLength += `${ele.length}\n`;
                cSpeed += `${ele.speed}\n`;
                cTdc += `${ele.tdc}\n`;
              }
              item.cautionLength = cLength;
              item.cautionSpeed = cSpeed;
              item.cautionTdc = cTdc;
              return item;
            });
        
           
          // Sort dataset based on date in ascending order
          this.dataset.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
             this.dataset.push(...data);
            hot.updateData(this.dataset);
          });
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

  //getting pdf on sign component

  //   const hot = this.hotRegisterer.getInstance(this.id);
  //   const exportPlugin = hot.getPlugin('exportFile');
  //   const exportedString = exportPlugin.exportAsString('csv', {
  //     bom: false,
  //     columnHeaders: true,
  //     exportHiddenColumns: true,
  //     exportHiddenRows: true,
  //     rowDelimiter: '\r\n',
  //   });
  //   const workbook = XLSX.utils.book_new();
  //   const jsonData = Papa.parse(exportedString);
  //   console.log('🚀 ~ jsonData:', jsonData.data[1]);
  //   let dataSet = jsonData.data.map((ele) => {
  //        ele.shift();
  //       ele.pop();
  //        return ele;
  //      });

  //   const doc = new jsPDF('p', 'pc', [300, 500]);
  //   // autoTable(doc, { html: '#table-wrapper' });
  //   autoTable(doc, {
  //     head: [jsonData.data.shift()],
  //     body: jsonData.data,
  //   });
  //   const pdfData = doc.output('datauristring');
  //   this.connect.setPdfData(pdfData);
  // }
  
    

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

    const data = this.dataset.filter((item) => {
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

    hot.updateData(this.dataset);
  }
}
