import { Component } from '@angular/core';
import { AddMachineConstComponent } from '../../../shared/add-machine-const/add-machine-const.component';

@Component({
  selector: 'app-maintenance-roll',
  standalone: true,
  templateUrl: './maintenance-roll.component.html',
  styleUrl: './maintenance-roll.component.css',
  imports: [AddMachineConstComponent],
})
export class MaintenanceRollComponent {}
