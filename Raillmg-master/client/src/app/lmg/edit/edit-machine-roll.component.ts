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
  styleUrls: ['./edit-machine-roll.component.css'], // Changed 'styleUrl' to 'styleUrls'
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
      changes?.forEach(([row, prop, oldValue, newValue]: Handsontable.CellChange) => {
        const headerKey = prop as string;
        const hot = this.hotRegisterer.getInstance(this.id);
        let id = hot.getDataAtRow(row)[0];
    
        if (oldValue === newValue || (newValue === '' && oldValue === undefined)) {
          return;
        }
    
        if (headerKey === 'date') {
          const parsedDate = DateTime.fromFormat(newValue, 'dd/MM/yyyy');
          if (!parsedDate.isValid) {
            this.toastService.showDanger('Date should be DD/MM/YYYY format');
            return;
          }
        }
    
        if (headerKey === 'block_times') {
          const timeRanges = newValue.split(',').map((range) => range.trim());
          let totalMinutes = 0;
        
          for (const range of timeRanges) {
            let startTime, endTime;
            if (range.includes('/')) {
              const [start, end] = range.split('/').map((time) => time.trim());
              startTime = start.split('-')[0].trim();
              endTime = end.trim();
            } else {
              [startTime, endTime] = range.split('-').map((time) => time.trim());
            }
        
            if (startTime && endTime) {
              const startParts = startTime.split(':').map(Number);
              const endParts = endTime.split(':').map(Number);
        
              const startTimeMs = startParts[0] * 60 + startParts[1];
              let endTimeMs = endParts[0] * 60 + endParts[1];
              if (endTimeMs < startTimeMs) {
                endTimeMs += 24 * 60; // Adjust for overnight ranges
              }
              totalMinutes += (endTimeMs - startTimeMs);
            } else {
              this.toastService.showDanger('Each time range must have both start and end times');
              return;
            }
          }
        
    
          hot.setDataAtRowProp(row, 'time_granted', totalMinutes);
          const avlDuration = hot.getDataAtRowProp(row, 'avl_duration') || 0;
          const burstTime = totalMinutes > avlDuration ? totalMinutes - avlDuration : 0;
          hot.setDataAtRowProp(row, 'time_burst', burstTime);
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
      if (event.target['classList'][0] === 'deleteBtn') {
        const hot = this.hotRegisterer.getInstance(this.id);
        let id = hot.getDataAtRow(coords.row)[0];
        if (!confirm('Are you sure you want to delete')) {
          return;
        }
        this.service.deleteRailDetails(this.domain, id).subscribe(() => {
          this.dataSet = this.dataSet.filter((item) => item._id !== id);
          hot.updateData(this.dataSet);
          this.toastService.showSuccess('Successfully Deleted');
        });
      }
      
    },
    
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
        this.service.getAllMachineRoll(this.domain).subscribe((data: any) => {
          let hot = this.hotRegisterer.getInstance(this.id);
          const purseValueMap: { [key: string]: number } = {};
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
            let cTimeLoss = '';
            for (let ele of item.caution) {
              cLength += `${ele.length}  \n`;
              cSpeed += `${ele.speed}  \n`;
              cTdc += `${ele.tdc} \n`;
              cTimeLoss += ele.timeloss ? `${ele.timeloss} \n` : '';
            }
  
            item.cautionLength = cLength;
            item.cautionSpeed = cSpeed;
            item.cautionTdc = cTdc;
            item.cautionTimeLoss = cTimeLoss;
  
         // Update remaining purse
         const purseString = item.purse;
         let remainPurse = null;

         if (purseString && purseString.includes(':')) {
           const purseValueString = purseString.split(':')[1].trim();
           const purseValue = parseFloat(purseValueString);

           if (!isNaN(purseValue)) {
             const timeGrantedValue = parseFloat(item.time_granted);

             if (!isNaN(timeGrantedValue)) {
               const machineType = item.machine;
               const prevRemainPurse = purseValueMap[machineType] || null;

               if (prevRemainPurse !== null) {
                 remainPurse = prevRemainPurse - timeGrantedValue;
               } else {
                 remainPurse = (purseValue) - timeGrantedValue;
               }

               purseValueMap[machineType] = remainPurse;
             }
           }
         }

         item.remain_purse = remainPurse;

         return item;
       });
  
          // Filter and modify data as needed
          data = data.filter(
            (item) =>
              this.userData.department === 'OPERATING' ||
              item.department === this.userData.department
          ).map((item) => {
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