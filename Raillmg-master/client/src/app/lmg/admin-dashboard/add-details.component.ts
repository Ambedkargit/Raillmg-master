import { CommonModule, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../app.service';
import { ToastService } from '../../shared/toast/toast.service';
import { NgbNavModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { IRailForm } from '../../shared/model/railForm.model';
import { ActivatedRoute, Router } from '@angular/router';
import { localStorageService } from '../../shared/service/local-storage.service';

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
  dataSet = [];

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

  onSelectBoard(e) {
    this.board = e.target.value;
    this.sectionList = [];

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
