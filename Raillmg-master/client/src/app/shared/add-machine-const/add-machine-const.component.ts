import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  NgbNavModule,
  NgbPopoverModule,
  NgbTimepickerModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  FormControl,
  FormsModule,
} from '@angular/forms';
import { IRailForm } from '../model/railForm.model';
import { DateTime } from 'luxon';
import { AppService } from '../../app.service';
import { AvailableSlotsConfig } from '../constants/available-slots';
import { IUser } from '../model/user.model';
import { localStorageService } from '../service/local-storage.service';
import { ToastService } from '../toast/toast.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ActivatedRoute, Route } from '@angular/router';
import { Router } from 'express';
import { PopupService } from '@ng-bootstrap/ng-bootstrap/util/popup';
import { Injectable } from '@angular/core';
import { authGuard } from '../service/auth-guard.service'
import { cautionTimeLoss } from '../constants/cautioncalculation';
import { MachinePurseService } from '../constants/machine-purse.service';
import { ListItem } from 'ng-multiselect-dropdown/multiselect.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { workTypeList } from '../constants/workTypeList';

@Component({
  selector: 'app-add-machine-const',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbPopoverModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    JsonPipe,
    NgbTimepickerModule,
    NgbNavModule,
    
  ],
  templateUrl: './add-machine-const.component.html',
  styleUrl: './add-machine-const.component.css',
})

@Injectable({
  providedIn:'root'
})

export class AddMachineConstComponent implements OnInit {
  @Input() domain;

  domainData = {
    machineRolls: 'MACHINE ROLLS',
    maintenanceRolls: 'MAINTENANCE ROLLS',
    machineNonRolls: 'MACHINE OUT OF ROLLING',
    maintenanceNonRolls: 'MAINTENANCE OUT OF ROLLING',
  };

  machineAndPurseList: { machine: string, purse: string }[] = [];
  selectedMachine: string = '';
  purse: string = '';
  form!: FormGroup;
  userData: Partial<IUser> = {};
  availableSlots = {};
  cautions = [];
  integrates = [];
  stations = [];
  machineType: { _id: ''; machine: '' }[];
  boardList: { _id: ''; board: '' }[];
  sectionList = [];
  value: any;
  railDetails: any[] = [];
  dataSet = [];
  slot: any = {
    date: '',
    startTime: '',
    endTime: '',
    timeLoss: 0,

  };
  slotIndex: any;
  dropdownSettings: IDropdownSettings = {
    idField: '_id',
    textField: 'machine',
    allowSearchFilter: true,
    maxHeight: 118,
    noDataAvailablePlaceholderText: 'There is no Available Slots',
  };
  AvlSlotSettings: IDropdownSettings = {
    idField: '_id',
    textField: 'machine',
    allowSearchFilter: true,
    maxHeight: 118,
    noDataAvailablePlaceholderText: 'There is no Available Slots',
  };
  isSlotSelected: boolean = false;
  toastr: any;
  myForm: FormGroup;
cautionMps: any;
index: any;

  onSlotSelect(event: any) {
      // You can adjust the condition based on the event to determine if a slot is selected.
      this.isSlotSelected = event && event.length > 0;
  }
  get machineFormArray(): FormArray {
    return this.form.controls['machineFormArray'] as FormArray;
  }

  get department(): FormControl {
    return this.form.controls['department'] as FormControl;
  }
  workTypeList = [
    'PQRS WORK',
    'MACHINE TAMPING',
    'M/C PACKING',
    'RAIL CARRYING',
    'CTR WORK',
    'PACKING',
    'MFI WORK',
    'TAMPING WORK',
    'DSMG WORK OF POINT,TRACK, BPAC & SIGNAL',
    'POST BCM',
    'POINT PACKING WORK',
    'CROSS OVER',
    'RAIL LOADING WORK',
    'RAIL UNLOADING WORK',
    'RAIL LOADING & UNLOADING',
    'LOCAL ADJUSTMENT OF CURVE AND ALLIGNMENT',
    'OTHERS'
  ];

  isOtherSelected: boolean = false;

  onWorkTypeChange(event: any) {
    const selectedValue = event.target.value;
    this.isOtherSelected = selectedValue === 'OTHERS';
  }
  constructor(
    private fb: FormBuilder,
    private service: AppService,
    private toastService: ToastService,
    private ls: localStorageService,
    private route: ActivatedRoute,
    private authGuard: authGuard,
    private machinePurseService: MachinePurseService,
    // private modalService: NgbModal // Inject the NgbModal service
  ) {

      this.myForm = this.fb.group({
        avlSlotOtherCheckBox: ['', Validators.required]
      });

  }
  
  ngOnInit(): void {

    this.loadMachineAndPurseList();
    this.initializeForm();
   // this.initializeForm();
   // Initialize the properties
    this.userData = this.ls.getUser();
    this.form = this.fb.group({
      department: this.fb.control(
        {
          value:
            this.userData.department === 'OPERATING'
              ? 'CONSTRUCTION'
              : this.userData.department,
          disabled: this.userData.department !== 'OPERATING',
        },
        Validators.required
      ),
      machineFormArray: this.fb.array([]),
    });

    // Promise.resolve().then(() => {
    //   this.service.getAllRailDetails('machines').subscribe((data) => {
    //     this.machineType = data.map((item) => item.machine);
    //   });
    // });

    Promise.resolve().then(() => {
      this.service.getAllRailDetails('boards').subscribe((data) => {
        this.boardList = data;
      });
    });
  }
  loadMachineAndPurseList(): void {
    this.service.getAllRailDetails('machine-purse').subscribe((data) => {
      this.machineAndPurseList = data.map(item => ({
        machine: item.machine,
        purse: item.purse
      }));
    });
  }
  onMachineSelected(item: ListItem): void {
    const machineName = item.toString();
    const selectedCombo = this.machineAndPurseList.find(combo => combo.machine === machineName);
    if (selectedCombo) {
      this.machinePurseService.machinePurseData.push(selectedCombo);
      this.form.get('machine')?.setValue(selectedCombo.machine);
      this.form.get('purse')?.setValue(selectedCombo.purse);
      this.updatePurseInput(selectedCombo.purse);
    }
    // this.toastService.showAlert(`Machine: ${selectedCombo.machine} Purse : ${selectedCombo.purse}`);
  }

  onMachineDeselected(item: ListItem): void {
    const machineName = item.toString();
    const index = this.machinePurseService.machinePurseData.findIndex(combo => combo.machine === machineName);
    if (index !== -1) {
      const deselectedCombo = this.machinePurseService.machinePurseData[index];
      this.machinePurseService.machinePurseData.splice(index, 1);
      this.form.get('machine')?.setValue('');
      this.form.get('purse')?.setValue('');
      this.removePurseFromInput(deselectedCombo.purse);
      // this.toastService.showAlert(`Machine: ${deselectedCombo.machine} Purse: ${deselectedCombo.purse} removed`);
    }
  }

  updatePurseInput(purse: string): void {
    const purseInput = document.getElementById('purse') as HTMLInputElement;
    purseInput.value += purse + ', ';
  }

  removePurseFromInput(purse: string): void {
    const purseInput = document.getElementById('purse') as HTMLInputElement;
    const purses = purseInput.value.split(',').map(p => p.trim()).filter(p => p !== purse && p !== '');
    purseInput.value = purses.join(', ') + (purses.length > 0 ? ', ' : '');
  }

  // Assuming you have a form initialization method
  initializeForm(): void {
    this.form = this.fb.group({
      machine: ['', Validators.required],
      purse: [''],
      machineFormArray: this.fb.array([this.createMachineFormGroup()])
    });
  }

  createMachineFormGroup(): FormGroup {
    return this.fb.group({
      purse: ['']
    });
  }

  getMachineNames(): string[] {
    return this.machineAndPurseList.map(item => item.machine);
  }

  onBoardSelect(index, event) {
    this.service
      .getAllRailDetails('railDetails?board=' + event.target.value)
      .subscribe((data) => {
        this.dataSet = data;
        this.sectionList[index] = data.map((ele) => ele.section);
      });
  }

  onSectionSelect(index, event) {
    let data = this.dataSet.filter((ele) => ele.section === event.target.value);
    this.railDetails[index] = data[0];
  }
  onStationSelect(index, event) {
    this.service
      .getAllRailDetails('stations?stations=' + event.target.value)
      .subscribe((res) => {
        console.log(index, res);

        // Check if machineFormArray and caution at index exist
        if (this.machineFormArray && this.machineFormArray.value[index]?.caution) {
          // Update caution's mps
          this.machineFormArray.value[index].caution.mps = res[0]?.mps || 0;
          this.cautionMps = res[0]?.mps || 0; // Assigning the mps value to cautionMps property
          console.log(this.machineFormArray.value[index].caution);
        } else {
          console.error(`Invalid index or caution object at index ${index}`);
        }
      });
    console.log(event.target.value);
  }

  onSubmit() {
    if (this.machineFormArray.value.length === 0 || !this.form.valid) {
      this.toastService.showWarning('Please fill all details');
      return;
    }
    //  add for Alert at tpc staff required

    // const userDepartment = this.authGuard.getUserDepartment();

    // const hasTPCStaff = this.machineFormArray.value.some(item => item.tpcStaff === "Yes");
    // const hasS_TStaff = this.machineFormArray.value.some(item => item.s_tStaff === "Yes");

    // if (hasTPCStaff || hasS_TStaff) {
    //     sessionStorage.setItem('showAlert', 'true');
    // }


    let payload = [];

    for (let [index, item] of this.machineFormArray.value.entries()) {
      let avlSlotList;
      if (item.avlSlotOtherCheckBox) {
        avlSlotList = item.avlSlotOther;
      } else {
        avlSlotList = item.availableSlot;
      }

      for (let slotItem of avlSlotList) {
        let splitSlot = [];
        // if (item.availableSlot) {
        //   // const regexPattern = new RegExp(
        //   //   '\\b([0-3][0-9]/[0-1][1-2]/\\d{4}) ([0-2][0-9]:[0-2][0-9]) to ([0-2][0-9]:[0-2][0-9]) (\\b(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\\b)\\b'
        //   // );
        //   // if (!regexPattern.test(item.avlSlotOther)) {
        //   //   this.toastService.showDanger('AVAILABLE SLOT ARE INCORRECT FORMAT');
        //   //   return;
        //   // }

        //   splitSlot = slotItem.split(' ');
        // } else {
        //   splitSlot = item.availableSlot.split(' ');
        // }
        splitSlot = slotItem.split(' ');

        if (!item.crewCheckbox || item.crew == null) {
          item.crew = 0;
        }
        if (!item.locoCheckbox || item.loco == null) {
          item.loco = 0;
        }
        item.caution = this.cautions[index];
        item.integrated = this.integrates[index];

        const dt = DateTime.now();
        const startTime = DateTime.fromFormat(splitSlot[1], 'HH:mm');
        let endTime = DateTime.fromFormat(splitSlot[3], 'HH:mm');
        if (endTime < startTime) {
          // Add a day to endTime if it is less than startTime
          endTime = endTime.plus({ days: 1 });
        }

        let timeDifferenceInMinutes = endTime.diff(startTime, 'minutes').minutes;
        timeDifferenceInMinutes = Math.max(timeDifferenceInMinutes, 0);
        // item.machine = item.machine.map((item) => {
        //   return item.machine.trim();
        // });
        
        payload.push({
          ...item,
          avl_start: splitSlot[1],
          avl_end: splitSlot[3],
          date: splitSlot[0],
          department: this.department.value,
          avl_duration: timeDifferenceInMinutes,
          createdAt: new Date().toISOString(),
          createdBy: this.userData.username,
          updatedAt: new Date().toISOString(),
          updatedBy: this.userData.username,

          logs: [],
        });
      }
    }
     console.log('🚀 ~ payload:', payload);
    // return;
    this.service.addRailDetails(this.domain, payload).subscribe((res) => {
      for (let index = this.machineFormArray.length - 1; index >= 0; index--) {
        this.machineFormArray.removeAt(index);
      }
      if (this.userData.department === 'OPERATING') {
        this.form.get('department')?.enable();
      }
      this.toastService.showSuccess('successfully submitted');
    });
  }

  onAddNewForm() {
    this.form.get('department')?.disable();
    this.sectionList.push([]);
    this.railDetails.push({
      _id: '',
      board: '',
      section: '',
      mps: 0,
      timeloss:0,
      slots: [],
      directions: [],
      stations: [],
    });
    const machineForm = this.fb.group({
      board: [''],
      section: [''],
      stationTo: [''],
      stationFrom: [''],
      direction: [''],
      lineNo: [null],
      machine: [null],
      purse:[null],
      series: [null],
      typeOfWork: [null],
      othertypeofWork: [null],
      dmd_duration: [null],
      availableSlot: [[]],
      avlSlotOther: [[]],
      avlSlotOtherCheckBox: [false],
      quantum: [null],
      deputedSupervisor: [null],
      resources: [null],
      km: [null],
      ni: [
        this.domain === 'machineRolls' || this.domain === 'maintenanceRolls'
          ? 'NON NI'
          : 'EMERGENT',
      ],
      // yard: [null],
      remarks: [null],
      approval: [''],
      s_tStaff: [''],
      tpcStaff: [''],
      // point: [null],
      // tower: [null],
      crew: [null],
      crewCheckbox: [false],
      loco: [null],
      cautionCheckbox: [false],
      caution: [{ length: '', tdc: '', speed: 0, mps: 0 ,id:'', timeloss:0 }],
      locoCheckbox: [false],
      // cancelTrain: [null],
      cancelTrainCheckbox: [false],
      integratedCheckbox: [false],
      integrated: [{ block: '', section1: '', duration: 0 }],
    });
    this.cautions.push([{ length: '', tdc: '', speed: 0, mps: 0, id:'', timeloss: 0 }]);
    this.integrates.push([{ block: '', section1: '', duration: 0 }]);
    this.machineFormArray.push(machineForm);

    const selectCtrl = machineForm.controls['section'] as FormControl;

    selectCtrl.valueChanges.subscribe((change) => {
      this.prepareAvailableSlots(change, '');
      machineForm.controls['direction'].setValue('');
    });

    const directionCtrl = machineForm.controls['direction'] as FormControl;
    directionCtrl.valueChanges.subscribe((change) => {
      this.prepareAvailableSlots(machineForm.controls['section'].value, change);
    });
  }

  addCaution(index) {
    this.cautions[index].push({ length: '', tdc: '', speed: 0, mps: 0, id:'', timeloss: 0 });
  }

  addIntegrated(index) {
    this.integrates[index].push({ block: '', section1: '', duration: 0 });
  }

  deleteCaution(i, index) {
    this.cautions[i] = this.cautions[i].filter((ele, ind) => index != ind);
  }

  deleteIntegrated(i, index) {
    this.integrates[i] = this.integrates[i].filter((ele, ind) => index != ind);
  }

  onDelete(index: number) {
    this.machineFormArray.removeAt(index);
    this.railDetails.splice(index, 1);
    this.sectionList.splice(index, 1);
    if (
      this.machineFormArray.length === 0 &&
      this.userData.department === 'OPERATING'
    ) {
      this.form.get('department')?.enable();
    }
  }

  cautionLength($event, index1, index2) {
    this.cautions[index1][index2]['length'] = $event.target.value;
    this.calculateTimeLoss(this.cautions[index1][index2],index1,index2)
  }

  cautionSpeed($event, index1, index2) {
    this.cautions[index1][index2]['speed'] = $event.target.value;
    this.calculateTimeLoss(this.cautions[index1][index2],index1,index2)
  }

  cautionTDC($event, index1, index2) {
    var parts = $event.target.value.split('-');
    var year = parts[0];
    var month = parts[1];
    var day = parts[2];
    this.cautions[index1][index2]['tdc'] = day + '/' + month + '/' + year;
    this.calculateTimeLoss(this.cautions[index1][index2],index1,index2)
  }


  // Function to generate ID
  calculateTimeLoss(caution,index1,index2) {
    console.log(caution,index1,index2)
    if (this.cautionMps==0 || caution.speed==0 || caution.length==0){
      return
     }
    const id = this.cautionMps + '/' + caution.speed + '/' + (caution.length / 100)
    console.log('Requested ID for Time Loss:', id);
    const entry = cautionTimeLoss.find(item => item.ID === id);
    console.log('Time Loss Entry:', entry);
    this.cautions[index1][index2]['timeloss']=entry.Time_Loss
    console.log('-----',entry.Time_Loss,entry)
    // return entry ? entry.Time_Loss : 0; // Return 0 if ID not found
  }

  // Function to generate ID

  // Function to generate ID and calculate time loss




  integratedBlock($event, index1, index2) {
    this.integrates[index1][index2]['block'] = $event.target.value;
  }
  integratedSection($event, index1, index2) {
    this.integrates[index1][index2]['section1'] = $event.target.value;
  }

  integratedDuration($event, index1, index2) {
    this.integrates[index1][index2]['duration'] = $event.target.value;
  }

  prepareAvailableSlots(section, direction) {
    if (!section || !direction || direction == '') {
      return;
    }

    if (this.availableSlots[section + '_' + direction]) {
      return;
    }

    let railData = {};

    for (let item of this.railDetails) {
      if (item.section == section) {
        railData = item;
        break;
      }
    }

    if (Object.keys(railData).length == 0) {
      this.toastService.showWarning('SLOTS are not Available');
      return;
    }
    const slotsList = railData['slots'][direction];

    let dt = DateTime.now();

    let avl_slot = [];
    for (let i = 0; i < 365; i++) {
      for (let slotDay in slotsList) {
        if (+dt.weekday == +slotDay || (+dt.weekday == 7 && +slotDay == 0)) {
          for (let slot of slotsList[slotDay]) {
            avl_slot.push(dt.toFormat('dd/MM/yyyy') + ' ' + slot);
          }
        }
      }
      dt = dt.plus({ days: 1 });
    }

    this.availableSlots[section + '_' + direction] = avl_slot;

    railData = {};
  }

  setSlotIndex(index) {
    this.slotIndex = index;
  }
  addSlot() {
    if (!this.slot.date || !this.slot.startTime || !this.slot.endTime) {
      this.toastService.showDanger('fill all details');
      return;
    }
    const parsedDate = DateTime.fromISO(this.slot.date);
    const formattedDate = parsedDate.toFormat('dd/LL/yyyy');
    let text = `${formattedDate} ${this.slot.startTime.hour}:${this.slot.startTime.minute} to ${this.slot.endTime.hour}:${this.slot.endTime.minute} hrs`;
    this.machineFormArray.value[this.slotIndex].avlSlotOther.push(text);
    this.slot = {
      date: '',
      startTime: '',
      endTime: '',
    };
  }
  deleteSlot(formIndex, slotIndex) {
    this.machineFormArray.value[this.slotIndex].avlSlotOther.splice(
      slotIndex,
      1
    );
  }
  // onSubmitSlot() {
  //   console.log(
  //     '🚀 ~ this.machineFormArray.value:',
  //     this.machineFormArray.value
  //   );
  // }
}