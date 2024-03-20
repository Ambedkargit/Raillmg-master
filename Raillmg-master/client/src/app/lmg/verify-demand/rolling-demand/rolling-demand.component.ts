import { Component } from '@angular/core';
import { HotTableModule } from '@handsontable/angular';
import { VerifyDemandTableComponent } from '../verify-demand-table/verify-demand-table.component';

@Component({
  selector: 'app-rolling-demand',
  standalone: true,
  imports: [HotTableModule, VerifyDemandTableComponent],
  templateUrl: './rolling-demand.component.html',
  styleUrl: './rolling-demand.component.css'
})
export class RollingDemandComponent {

}
