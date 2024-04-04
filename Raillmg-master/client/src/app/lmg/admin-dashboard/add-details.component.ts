import { CommonModule, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../app.service';
import { ToastService } from '../../shared/toast/toast.service';
import { NgbNavModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { IRailForm } from '../../shared/model/railForm.model';
import { ActivatedRoute, Router } from '@angular/router';
import { localStorageService } from '../../shared/service/local-storage.service';
import { columns } from '../../shared/constants/table-columns';
import Handsontable from 'handsontable';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DateTime } from 'luxon';
import { HotTableModule, HotTableRegisterer } from '@handsontable/angular';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    JsonPipe,
    NgbTimepickerModule,
    NgbNavModule,
  ],
  templateUrl: './add-details.component.html',
  styleUrl: './add-details.component.css',
})
export class AddDetailsComponent implements OnInit {
  

columns: any[] = columns; // Assign the columns array
// dataSet: any[] = [];
selectedColumns: string[] = [];
generatedReport :any;
  startDate: any;
  endDate: any;
  dataset: any;
  filteredData: any[];
  selectedBoard: any;

generateReport() {
  console.log('Generating report with columns:', this.selectedColumns);
  console.log('DataSet:', this.dataSet);
  this.generatedReport = this.generateReportLogic(this.selectedColumns);
}
generateReportLogic(selectedColumns: string[]): any {
  if (!this.dataSet || this.dataSet.length === 0) {
    console.error('Dataset is empty or undefined!');
    return null; // Return null or handle error appropriately
  }

  // Filter the dataset based on the selected date range
  const filteredData = this.dataSet.filter(item => {
    // Ensure the 'date' property exists and is valid
    if (!item.date || typeof item.date !== 'string'||
    !item.board || typeof item.board !== 'string') {
      return false;
    }

    const parsedDate = DateTime.fromFormat(item.date, 'dd/MM/yyyy');

    // Check if the parsedDate falls within the selected date range
    if (
      (this.startDate === undefined || this.startDate <= parsedDate) &&
      (this.endDate === undefined || this.endDate >= parsedDate)
      &&
      (this.selectedBoard === undefined || this.selectedBoard === item.board)
    ) {
      return true;
    }

    return false;
  }).map(item => {
    // Create a filtered item object with selected columns
    const filteredItem: any = {};
    selectedColumns.forEach(column => {
      // Check if column exists in item before accessing it
      if (item.hasOwnProperty(column)) {
        filteredItem[column] = item[column];
      } else {
        console.warn(`Column "${column}" not found in dataset row!`);
      }
    });
    return filteredItem;
  });
  filteredData.sort((a, b) => {
    const dateA = DateTime.fromFormat(a.date, 'dd/MM/yyyy');
    const dateB = DateTime.fromFormat(b.date, 'dd/MM/yyyy');
    return dateA.toMillis() - dateB.toMillis();
  });

  // Construct the report object
  const report = {
    selectedColumns: selectedColumns,
    reportData: filteredData
  };

  return report;
}
onColumnSelectionChange(columnTitle: string) {
  const index = this.selectedColumns.indexOf(columnTitle);
  if (index === -1) {
    this.selectedColumns.push(columnTitle);
  } else {
    this.selectedColumns.splice(index, 1);
  }
}

// downloadPDF() {
//   const element = document.getElementById('report-preview');
//   const reportNameInput = document.getElementById('typeahead-format') as HTMLInputElement;

//   if (!element || !reportNameInput) {
//     console.error('Element not found');
//     return;
//   }

//   const originalStyle = element.style.overflow;
//   element.style.overflow = 'visible'; // Set overflow to visible to capture entire content

//   html2canvas(element, { 
//     scrollX: 0, 
//     scrollY: 0, 
//     width: document.documentElement.scrollWidth, 
//     height: document.documentElement.scrollHeight 
//   }).then((canvas) => {
//     const imgData = canvas.toDataURL('image/png');
//     const pdf = new jsPDF();
//     const imgWidth = 210;
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;

//     pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

//     // Reset overflow style
//     element.style.overflow = originalStyle;

//     // Download PDF with the name from the input field
//     const fileName = reportNameInput.value.trim() || 'generated_report';
//     pdf.save(${fileName}.pdf);
//   });
// }

downloadExcel() {
  const reportData = this.generateReportLogic(this.selectedColumns);

  if (!reportData || reportData.reportData.length === 0) {
    console.error('No data available for download');
    return;
  }

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Convert column headings to uppercase
  const uppercaseColumns = reportData.selectedColumns.map(column => column.toUpperCase());

  // Convert report data to worksheet data array
  const wsData = [uppercaseColumns, ...reportData.reportData.map(row =>
    reportData.selectedColumns.map(column => {
      const value = row[column];
      // Format values as objects to handle commas and special characters
      if (value === null) {
        return { v: '', t: 's' }; // Leave the cell blank
      } else {
        return { v: value, t: typeof value === 'string' ? 's' : 'n' };
      }
    })
  )];

  // Convert worksheet data array to worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Report');

  // Generate a Blob object containing the workbook data
  const wbData = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

  // Convert workbook data to a Blob object
  const wbBlob = new Blob([wbData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Trigger download
  const fileName = (document.getElementById('typeahead-format') as HTMLInputElement).value.trim() || 'generated_report';
  this.saveBlob(wbBlob, `${fileName}.xlsx`);
}

saveBlob(blob: Blob, fileName: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', fileName);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


  active = 'board';
  board = '';
  section = '';
  mps = '';
  station = '';
  machine = '';
  slot = '';
  sectionSelected: any = {};
  stationSelected: any = {};
  boardList = [];
  sectionList = [];
  machineList = [];
  selectIndex: number;
  dataSet: any[] = [];

  directions = [
    {
      id: 1,
      direction: 'up',
      days: [],
      start: {},
      end: {},
      checked: false,
    },
    {
      id: 2,
      direction: 'down',
      days: [],
      start: {},
      end: {},
      checked: false,
    },
    {
      id: 3,
      direction: 'both',
      days: [],
      start: {},
      end: {},
      checked: false,
    },
    {
      id: 4,
      direction: 'north',
      days: [],
      start: {},
      end: {},
      checked: false,
    },
    {
      id: 5,
      direction: 'south',
      days: [],
      start: {},
      end: {},
      checked: false,
    },
  ];

  stationList = [];
  selectedAvl: number;
  railForm: IRailForm[] = [];
  avlPreview = {};
  weekdays = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];
  
  boardDataset = [];
createReport: any;
  constructor(
    private service: AppService,
    private toastService: ToastService,
    private router: Router,
    private ls: localStorageService
  ) {
    let user = this.ls.getUser();
    if (user.department !== 'OPERATING') this.router.navigate(['/lmg']);
  }

  ngOnInit() {
    Promise.resolve().then(() => {
      this.service.getAllRailDetails('boards').subscribe((data) => {
        this.boardDataset = data;
        for (let item of data) {
          this.boardList.push(item.board);
        }
      });
    });
    Promise.resolve().then(() => {
      this.service.getAllRailDetails('railDetails').subscribe((data) => {
        this.dataSet = data;
      });
    });
    Promise.resolve().then(() => {
      this.service.getAllRailDetails('machines').subscribe((data) => {
        this.machineList = data;
      });
    });
    
    
  }
OnSelectRolling(e){
 console.log(e.target.value)
 let title=e.target.value
 let domain = [];
 this.dataSet = [];
      if (title == 'ROLLING') {
        domain = ['machineRolls', 'maintenanceRolls'];
      } else if (title === 'NON-ROLLING') {
        domain = ['maintenanceNonRolls', 'machineNonRolls'];
      } 
      else if (title === 'ROLLING / NON-ROLLING') {
        domain = ['machineRolls', 'maintenanceRolls', 'maintenanceNonRolls', 'machineNonRolls'];
      }
  for (let ele of domain) {
    Promise.resolve().then(() => {
      this.service.getAllMachineRoll(ele).subscribe((data) => {
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
          let cTimeLoss ='';
          for (let ele of item.caution) {
            cLength += `${ele.length}\n`;
            cSpeed += `${ele.speed}\n`;
            cTdc += `${ele.tdc}\n`;
            cTimeLoss +=ele.timeloss? `${ ele.timeloss} \n`:''; 
          }
          item.cautionLength = cLength;
          item.cautionSpeed = cSpeed;
          item.cautionTdc = cTdc;
          item.cautionTimeLoss= cTimeLoss;
          return item;
        });
    
        // Update dataset and Handsontable
        this.dataSet.push(...data);
        
      });
    });
  }
  console.log('data---',this.dataSet)

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

  if (!Array.isArray(this.dataSet)) {
    console.error("Dataset is not an array.");
    return;
  }

  const data = this.dataSet.filter((item) => {
    // Ensure the 'date' property exists and is valid
    if (!item.date || typeof item.date !== 'string') {
      return false;
    }

    const parsedDate = DateTime.fromFormat(item.date, 'dd/MM/yyyy');

    // Check if the parsedDate falls within the selected date range
    if (
      (this.startDate === undefined || this.startDate <= parsedDate) &&
      (this.endDate === undefined || this.endDate >= parsedDate)
    ) {
      return true;
    }

    return false;
  });

  // Update the dataset with filtered data
  this.filteredData = data;
}

  onSelectBoard(e) {
    this.board = e.target.value;
    this.sectionList = [];
    this.selectedBoard =e.target.value;

    for (let item of this.dataSet) {
      if (item.board === this.board) {
        this.sectionList.push(item.section);
      }
    }
    this.onSelectSection(this.sectionList[0]);
  }

  onSelectSection(e) {
    if (e.target != undefined) {
      this.section = e.target.value;
    } else {
      this.section = e;
    }
    for (let index in this.dataSet) {
      if (
        this.dataSet[index].board === this.board &&
        this.dataSet[index].section === this.section
      ) {
        this.sectionSelected = this.dataSet[index];
        this.selectIndex = +index;
      }
    }
    if (this.active == 'mps' || this.active == 'station') {
      this.service
        .getAllRailDetails(
          'stations?stations=' + this.sectionSelected['stations']
        )
        .subscribe((res) => {
          this.stationList = res;
        });
    }
  }

  onSelectStation(e) {
    this.stationSelected = JSON.parse(e.target.value);
  }

  onSubmitAvl() {
    if (this.board == '' || this.section == '') {
      this.toastService.showWarning('enter valid Details');
      return;
    }

    for (let item of this.directions) {
      if (!item.checked) {
        continue;
      }

      const startHur =
        item.start['hour'] < 10 ? '0' + item.start['hour'] : item.start['hour'];
      const startMin =
        item.start['minute'] < 10
          ? '0' + item.start['minute']
          : item.start['minute'];
      const endHur =
        item.end['hour'] < 10 ? '0' + item.end['hour'] : item.end['hour'];
      const endMin =
        item.end['minute'] < 10 ? '0' + item.end['minute'] : item.end['minute'];

      for (let day in item.days) {
        if (!item.days[day]) {
          continue;
        }

        if (!this.sectionSelected['slots']) {
          this.sectionSelected.slots = {};
        }
        if (!this.sectionSelected.slots[item.direction]) {
          this.sectionSelected.slots[item.direction] = {};
        }

        if (!this.sectionSelected['slots'][item.direction][day]) {
          this.sectionSelected['slots'][item.direction][day] = [];
        }
        this.sectionSelected['slots'][item.direction][day].push(
          `${startHur}:${startMin} to ${endHur}:${endMin} hrs ${this.weekdays[day]}`
        );
      }

      this.avlPreview[item.direction] =
        this.sectionSelected['slots'][item.direction];
    }

    if (
      this.board == '' ||
      this.section == '' ||
      Object.keys(this.avlPreview).length == 0
    ) {
      this.toastService.showWarning('enter valid Details');
      return;
    }

    const dirSet = new Set([
      ...this.sectionSelected['directions'],
      ...Object.keys(this.avlPreview),
    ]);
    const payload = {
      directions: [...dirSet],
      slots: { ...this.sectionSelected['slots'], ...this.avlPreview },
    };

    this.updateAvlSlot(payload);

    this.avlPreview = [];
  }

  addBoard() {
    if (this.board == '') {
      this.toastService.showWarning('enter valid Details');
      return;
    }
    if (this.boardList.includes(this.board)) {
      this.toastService.showDanger(this.board + ' is already existed');
      return;
    }

    const payload = {
      board: this.board,
    };
    this.service.addRailDetails('boards', payload).subscribe((res) => {
      this.toastService.showSuccess('successfully submitted');
      this.boardList.push(this.board);
      this.board = '';
      this.boardDataset.push(res);
    });
  }

  addSection() {
    if (this.board == '' || this.section == '') {
      this.toastService.showWarning('enter valid Details');
      return;
    }
    const payload = { board: this.board, section: this.section };
    this.service.addRailDetails('railDetails', payload).subscribe((res) => {
      if (res.code == 11000) {
        this.toastService.showDanger(this.section + ' is already existed');
      } else {
        this.dataSet[this.dataSet.length] = res;
        this.sectionList.push(this.section);
        this.toastService.showSuccess('successfully submitted');
      }
    });
  }

  addMPS(add = true, edit = false) {
    if (
      (this.board == '' || this.section == '' || this.mps == '') &&
      add &&
      !edit
    ) {
      this.toastService.showWarning('enter valid Details');
      return;
    }
    if (this.stationSelected.mps !== 0 && !edit) {
      this.toastService.showDanger(this.mps + " is couldn't update");
      return;
    }

    let payload = { mps: 0 };
    if (edit) {
      this.mps = prompt('enter the new MPS', this.stationSelected.mps);
      if (
        this.mps === null ||
        this.mps == '0' ||
        this.mps === this.stationSelected.mps
      ) {
        return;
      }
    }

    if (add || edit) {
      payload.mps = +this.mps;
    } else {
      const confirmDelete = confirm('Are you sure to delete :' + this.mps);
      if (!confirmDelete) {
        return;
      }
    }

    this.service
      .updateRailDetails('stations', this.stationSelected['_id'], payload)
      .subscribe((res) => {
        this.stationSelected = res;
        this.toastService.showSuccess('successfully submitted');
      });
  }

  addStation() {
    if (this.board == '' || this.section == '' || this.station == '') {
      this.toastService.showWarning('enter valid Details');
      return;
    }

    const payload = {
      stations: [...this.sectionSelected['stations'], this.station],
    };

    const payload2 = {
      station: this.station,
      mps: 0,
    };

    this.service.addRailDetails('stations', payload2).subscribe((res) => {
      if (res.code == 11000) {
        this.toastService.showDanger(this.station + ' is already existed');
        return;
      } else {
        this.stationList.push(res);
        this.updateStation(payload);
      }
    });
  }

  addMachine() {
    if (this.machine == '') {
      this.toastService.showWarning('enter valid Details');
      return;
    }
    if (this.machineList.includes(this.machine)) {
      this.toastService.showDanger(this.machine + ' is already existed');
      return;
    }
    const payload = { machine: this.machine };
    this.service.addRailDetails('machines', payload).subscribe((res) => {
      this.toastService.showSuccess('successfully submitted');
      this.machineList.push(res);
      this.machine = '';
    });
  }

  onDeleteBoard(data) {
    const confirmDelete = confirm(
      'entire data of ' + data.board + ' is deleted'
    );
    if (!confirmDelete) {
      return;
    }

    for (let ele of this.dataSet) {
      if (ele.board == data.board) {
        this.service
          .deleteRailDetails('railDetails', ele._id)
          .subscribe((res) => {});
      }
    }

    this.service.deleteRailDetails('boards', data._id).subscribe(() => {
      this.boardList = this.boardList.filter((ele) => ele != data.board);
      this.boardDataset = this.boardDataset.filter(
        (ele) => ele.board !== data.board
      );
      this.toastService.showSuccess('successfully deleted');
    });
  }

  onDeleteSection(id, section) {
    const confirmDelete = confirm('entire data of ' + section + ' is deleted');
    if (!confirmDelete) {
      return;
    }
    this.service.deleteRailDetails('railDetails', id).subscribe((res) => {
      this.dataSet = this.dataSet.filter((ele) => ele._id != id);
      this.toastService.showSuccess('successfully deleted');
    });
  }

  onDeleteMachine(data) {
    const confirmDelete = confirm('Are you sure to delete :' + data.machine);
    if (!confirmDelete) {
      return;
    }
    this.service.deleteRailDetails('machines', data._id).subscribe((res) => {
      this.machineList = this.machineList.filter((ele) => ele._id != data._id);
      this.toastService.showSuccess('successfully deleted');
    });
  }

  onDeleteStation(data) {
    const confirmDelete = confirm('Are you sure to delete : ' + data);
    if (!confirmDelete) {
      return;
    }
    const filterStations = this.sectionSelected['stations'].filter(
      (ele) => ele !== data
    );
    const payload = {
      stations: filterStations,
    };
    const deleteData = this.stationList.find((item) => item.station == data);

    this.service.deleteRailDetails('stations', deleteData._id).subscribe();

    this.updateStation(payload);
  }

  onDeleteAvlSlot(data) {
    const confirmDelete = confirm('Are you sure to delete :' + data);
    if (!confirmDelete) {
      return;
    }

    const filterDir = this.sectionSelected['directions'].filter(
      (ele) => ele !== data
    );
    const tempSlot = { ...this.sectionSelected['slots'] };
    delete tempSlot[data];

    const payload = {
      directions: filterDir,
      slots: tempSlot,
    };
    this.updateAvlSlot(payload);
  }

  updateAvlSlot(payload) {
    this.service
      .updateRailDetails('railDetails', this.sectionSelected['_id'], payload)
      .subscribe((res) => {
        this.toastService.showSuccess('successfully submitted');
        this.dataSet[this.selectIndex] = res;
        this.sectionSelected = res;
      });
  }

  updateStation(payload) {
    this.service
      .updateRailDetails('railDetails', this.sectionSelected['_id'], payload)
      .subscribe((res) => {
        if (res.code == 11000) {
          this.toastService.showDanger(this.station + ' is already existed');
        } else {
          this.toastService.showSuccess('successfully submitted');
          this.dataSet[this.selectIndex] = res;
          this.sectionSelected = res;
        }
      });
  }

  editBoard(data) {
    const renameBoard = prompt('Rename the board:', data.board);
    if (renameBoard === null || renameBoard === data.board) {
      return;
    }

    for (let ele of this.dataSet) {
      if (ele.board == data.board) {
        this.service
          .updateRailDetails('railDetails', ele._id, { board: renameBoard })
          .subscribe((res) => {
            this.dataSet = this.dataSet.map((item) => {
              if (item._id === res._id) {
                item.board = res.board;
              }
              return item;
            });
          });
      }
    }
    console.log('🚀 ~ dataSet:', this.dataSet);

    this.service
      .updateRailDetails('boards', data._id, { board: renameBoard })
      .subscribe(() => {
        this.boardList = this.boardList.map((ele) => {
          if (ele == data.board) {
            ele = renameBoard;
          }
          return ele;
        });
        this.boardDataset = this.boardDataset.map((ele) => {
          if (ele.board === data.board) {
            ele.board = renameBoard;
          }
          return ele;
        });
        console.log('🚀 ~ boardDataset:', this.boardDataset);
        this.toastService.showSuccess('successfully Updated');
      });
  }

  editSection(data, index) {
    const renameSection = prompt('Rename the section:', data.section);
    if (renameSection == null || renameSection === data.section) {
      return;
    }

    const payload = { section: renameSection };
    this.service
      .updateRailDetails('railDetails', data._id, payload)
      .subscribe((res) => {
        if (res.code == 11000) {
          this.toastService.showDanger(renameSection + ' is already existed');
        } else {
          this.dataSet[index] = res;

          this.sectionList.splice(
            this.sectionList.indexOf(data.section),
            1,
            renameSection
          );

          this.toastService.showSuccess('successfully Updated');
        }
      });
  }

  editStation(data, index) {
    const renameStation = prompt('Rename the Station:', data);
    if (renameStation === null || renameStation === data) {
      return;
    }

    let stationsEdit = [...this.sectionSelected['stations']];
    stationsEdit.splice(index, 1);
    const payload = {
      stations: [...stationsEdit, renameStation],
    };
    const payload2 = { station: renameStation };
    const editData = this.stationList.find((item) => item.station == data);
    this.service
      .updateRailDetails('stations', editData._id, payload2)
      .subscribe((res) => {
        if (res.code == 11000) {
          this.toastService.showDanger(renameStation + ' is already existed');
          return;
        } else {
          this.stationList = this.stationList.map((ele) => {
            if (ele.station == data) {
              ele.station = renameStation;
            }
            return ele;
          });
          this.sectionSelected['stations'][index] = renameStation;
          this.updateStation(payload);
        }
      });
  }

  editMachine(data, index) {
    const renameMachine = prompt('Rename the Machine:', data.machine);
    if (renameMachine === null || renameMachine === data.machine) {
      return;
    }

    const payload = {
      machine: renameMachine,
    };

    this.service
      .updateRailDetails('machines', data._id, payload)
      .subscribe((res) => {
        this.machineList[index] = res;
        this.toastService.showSuccess('successfully Updated');
      });
  }
  onTabChange() {
    this.board = '';
    this.section = '';
    this.sectionList = [];
    this.directions = [
      {
        id: 1,
        direction: 'up',
        days: [],
        start: {},
        end: {},
        checked: false,
      },
      {
        id: 2,
        direction: 'down',
        days: [],
        start: {},
        end: {},
        checked: false,
      },
      {
        id: 3,
        direction: 'both',
        days: [],
        start: {},
        end: {},
        checked: false,
      },
      {
        id: 4,
        direction: 'north',
        days: [],
        start: {},
        end: {},
        checked: false,
      },
      {
        id: 5,
        direction: 'south',
        days: [],
        start: {},
        end: {},
        checked: false,
      },
    ];
    this.sectionSelected = {};
  }
}
function generateReportLogic(selectedColumns: string[]): any {
  throw new Error('Function not implemented.');
}

function downloadPDF() {
  throw new Error('Function not implemented.');
}