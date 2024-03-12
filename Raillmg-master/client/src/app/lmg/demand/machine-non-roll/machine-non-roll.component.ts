import { Component } from '@angular/core';
import { AddMachineConstComponent } from '../../../shared/add-machine-const/add-machine-const.component';

@Component({
  selector: 'app-machine-non-roll',
  standalone: true,
  templateUrl: './machine-non-roll.component.html',
  styleUrl: './machine-non-roll.component.css',
  imports: [AddMachineConstComponent],
})
export class MachineNonRollComponent {}
