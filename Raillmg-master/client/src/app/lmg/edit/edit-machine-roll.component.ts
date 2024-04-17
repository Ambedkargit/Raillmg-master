import { Component } from '@angular/core';
import { HotTableModule, HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { hotSettings } from '../../shared/constants/hotSettings';
import { AppService } from '../../app.service';
import { localStorageService } from '../../shared/service/local-storage.service';
import { ToastService } from '../../shared/toast/toast.service';
import { IUser } from '../../shared/model/user.model';
import { DateTime } from 'luxon';
import { IMachineRoll } from '../../shared/model/machineRoll.model';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { columns } from '../../shared/constants/table-columns';

@Component({
  selector: 'app-machine-roll',
  standalone: true,
  imports: [HotTableModule, CommonModule],
  templateUrl: './edit-machine-roll.component.html',
  styleUrl: './edit-machine-roll.component.css',
})
export class EditMachineRollComponent {
  userData: IUser;
  private hotRegisterer = new HotTableRegisterer();
  id = 'hotInstance';
  dataSet: IMachineRoll[] = [];
  domain: string;
  columns = [
    ...columns,
    {
      data: 'delete',
      title: 'DELETE',
      width: 100,
      editor: false,
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        td.className = 'htCenter htMiddle';
        td.innerHTML = `<button class="deleteBtn btn btn-danger form-control" (click)="onDelete()">DELETE</button>`;
        return td;
      },
    },
  ];

  hotSettings: Handsontable.GridSettings = {
    ...hotSettings,
    columns: this.columns,
    height: '80vh',
    afterChange: (changes) => {
      changes?.forEach(
        ([row, prop, oldValue, newValue]: Handsontable.CellChange) => {
          const headerKey = prop as string;

          const hot = this.hotRegisterer.getInstance(this.id);
          let id = hot.getDataAtRow(row)[0];
          if (
            oldValue == newValue ||
            (newValue == '' && oldValue == undefined)
          ) {
            return;
          }
          if (headerKey === 'date') {
            const parsedDate = DateTime.fromFormat(newValue, 'dd/MM/yyyy');

            if (!parsedDate.isValid) {
              this.toastService.showDanger('Date should be DD/MM/YYYY format');
              return;
            }
          }

          if (headerKey === 'block_start' || headerKey === 'block_end') {
            const startTime = hot.getDataAtRowProp(row, 'block_start');
            const endTime = hot.getDataAtRowProp(row, 'block_end');
    
            // Ensure both startTime and endTime are not null or undefined
            if (startTime && endTime) {
              // Parse startTime and endTime strings into hours and minutes
              const startParts = startTime.split(':').map(Number);
              const endParts = endTime.split(':').map(Number);
    
             
              // Calculate time difference in minutes
              const startTimeMs = startParts[0] * 60 + startParts[1];
              let endTimeMs = endParts[0] * 60 + endParts[1];
              if(endTimeMs < startTimeMs){
                 endTimeMs += 24 * 60;
              }
              const timeDiffMinutes = endTimeMs - startTimeMs;

              // Update 'time_granted' and 'time_burst' based on time difference in minutes
              const timeDiffMinutesNum = Number(timeDiffMinutes); // Convert to number
              hot.setDataAtRowProp(row, 'time_granted', timeDiffMinutes);
              const avlDuration = hot.getDataAtRowProp(row, 'avl_duration') || 0;
              hot.setDataAtRowProp(row, 'time_burst', timeDiffMinutes - avlDuration);
            }
          }
          let data = this.dataSet.find((item) => item._id === id);
          if (!data.logs.length) data.logs = [];

          const log = {
            updatedBy: this.userData['username'],
            updatedAt: new Date().toISOString(),
            field: headerKey,
            oldValue,
            newValue,
          };

          const payload: Partial<IMachineRoll> = {
            [headerKey]: newValue,
            updatedBy: this.userData['username'],
            updatedAt: new Date().toISOString(),
            logs: [...data.logs, log],
          };

          this.service
            .updateRailDetails(this.domain, id, payload)
            .subscribe((res: IMachineRoll) => {
              Object.assign(data, res);
              hot.render();
              const column = hot.propToCol(headerKey);
              const cell = hot.getCell(row, column as number);
              cell.style.backgroundColor = 'lightblue';
              cell.className = 'updatedCell';
              this.toastService.showSuccess('successfully Updated');
            });
        }
      );
    },
    afterOnCellMouseUp: (event, coords, TD) => {
      if (event.target['classList'][0] == 'deleteBtn') {
        const hot = this.hotRegisterer.getInstance(this.id);
        let id = hot.getDataAtRow(coords.row)[0];
        if (!confirm('Are you sure want to delete')) {
          return;
        }
        this.service.deleteRailDetails(this.domain, id).subscribe((res) => {
          this.dataSet = this.dataSet.filter((item) => item._id !== id);
          hot.updateData(this.dataSet);
          this.toastService.showSuccess('SUCCESSFULLY DELETED');
        });
      }
    },
    // afterOnCellMouseDown(event, coords, TD) {
    //   TD.className = (coords.row % 2 == 0 ? 'evenCell' : 'oddCell') + ' wraptext'
    // },
  };

  constructor(
    private service: AppService,
    private ls: localStorageService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userData = this.ls.getUser();
    this.route.params.subscribe((url) => {
      this.domain = url['domain'];

      Promise.resolve().then(() => {
        this.service
          .getAllMachineRoll(this.domain)
          .subscribe((data: any) => {
           let hot = this.hotRegisterer.getInstance(this.id);
            data = data.map((item) => {


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
              let cTimeLoss ='';
              for (let ele of item.caution) {
                cLength += `${ele.length}  \n`;
                cSpeed += `${ele.speed}  \n`;
                cTdc += `${ ele.tdc} \n`;
                cTimeLoss +=ele.timeloss? `${ ele.timeloss} \n`:''; 
              }

              item.cautionLength = cLength;
              item.cautionSpeed = cSpeed;
              item.cautionTdc = cTdc;
              item.cautionTimeLoss= cTimeLoss;
               

              return item;
              });

            data = data.filter(
                (item) =>
                  this.userData.department === 'OPERATING' ||
                  item.department === this.userData.department
              )
              .map((item) => {
                item['delete'] = `DELETE`;
                return item;
              });

            this.dataSet = data;
            hot.updateData(data);
          });
      });
    });
  }
}
