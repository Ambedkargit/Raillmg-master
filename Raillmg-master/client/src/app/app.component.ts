import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AppService } from './app.service';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { ToastComponent } from './shared/toast/toast.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { ReportComponent } from './lmg/report/report.component';
import { AddMachineConstComponent } from './shared/add-machine-const/add-machine-const.component';
import { MachineNonRollComponent } from './lmg/demand/machine-non-roll/machine-non-roll.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    RouterOutlet,
    SpinnerComponent,
    ToastComponent,
    NavbarComponent,
    ReportComponent,
    AddMachineConstComponent,
    MachineNonRollComponent
   

  ],
  providers: [],
})
export class AppComponent implements OnInit {
  isLoading = false;
  constructor(private service: AppService) {}

  ngOnInit() {
    this.service.isLoading$.subscribe((res) => (this.isLoading = res));
  }
}
