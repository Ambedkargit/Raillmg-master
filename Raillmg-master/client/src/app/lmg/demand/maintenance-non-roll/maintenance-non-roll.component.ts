import { Component } from '@angular/core';
import { AddMachineConstComponent } from '../../../shared/add-machine-const/add-machine-const.component';

@Component({
  selector: 'app-maintenance-non-roll',
  standalone: true,
  templateUrl: './maintenance-non-roll.component.html',
  styleUrl: './maintenance-non-roll.component.css',
  imports: [AddMachineConstComponent],
})
export class MaintenanceNonRollComponent {}
