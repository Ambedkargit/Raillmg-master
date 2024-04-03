import { Routes } from '@angular/router';
import { HomePageComponent } from './lmg/home-page/home-page.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AddMachineRollComponent } from './lmg/demand/add-machine-roll/add-machine-roll.component';
import { authGuard } from './shared/service/auth-guard.service';
import { LmgComponent } from './lmg/lmg.component';
import { MachineNonRollComponent } from './lmg/demand/machine-non-roll/machine-non-roll.component';
import { MaintenanceRollComponent } from './lmg/demand/maintenance-roll/maintenance-roll.component';
import { MaintenanceNonRollComponent } from './lmg/demand/maintenance-non-roll/maintenance-non-roll.component';
import { MachineUploadFileComponent } from './lmg/demand/machine-upload-file/machine-upload-file.component';
import { EditMachineRollComponent } from './lmg/edit/edit-machine-roll.component';
import { AddDetailsComponent } from './lmg/admin-dashboard/add-details.component';
import { MachineRollComponent } from './lmg/report/machine-roll/machine-roll.component';
import { ReportComponent } from './lmg/report/report.component';
import { UserDetailsComponent } from './lmg/user-details/user-details.component';
import { RollingDemandComponent } from './lmg/verify-demand/rolling-demand/rolling-demand.component';
import { NonRollingDemandComponent } from './lmg/verify-demand/non-rolling-demand/non-rolling-demand.component';
import { SignNonRollingDemandComponent } from './lmg/sign/sign-non-rolling-demand/sign-non-rolling-demand.component';
import { SignRollingDemandComponent } from './lmg/sign/sign-rolling-demand/sign-rolling-demand.component';
import { DigitalSignComponent } from './lmg/sign/digital-sign/digital-sign.component';

export const routes: Routes = [
  {
    path: 'lmg',
    component: LmgComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: HomePageComponent,
      },
      {
        path: 'demand',
        children: [
          {
            path: 'machine-roll',
            component: AddMachineRollComponent,
          },
          {
            path: 'machine-non-roll',
            component: MachineNonRollComponent,
          },
          {
            path: 'maintenance-roll',
            component: MaintenanceRollComponent,
          },
          {
            path: 'maintenance-non-roll',
            component: MaintenanceNonRollComponent,
          },
          {
            path: 'machine-upload-file',
            component: MachineUploadFileComponent,
          },
        ],
      },
      {
        path: 'verify-demand',
        // component: VerifyDemandComponent,
        children: [
        { path: 'rolling', component: RollingDemandComponent},
        { path: 'non-Rolling', component: NonRollingDemandComponent},
        ],
      },
      {
        path: 'report',
        // component: ReportComponent,
        children: [
          {
            path: ':id',
            component: MachineRollComponent,
          },
          {
            path: 'machineRolls',
            component: MachineRollComponent,
          },
          {
            path: 'machineNonRolls',
            component: MachineRollComponent,
          },
          {
            path: 'maintenanceRolls',
            component: MachineRollComponent,
          },
          {
            path: 'maintenanceNonRolls',
            component: MachineRollComponent,
          },
          {
            path: 'all-rolling',
            component: MachineRollComponent,
          },
          {
            path: 'all-non-rolling',
            component: MachineRollComponent,
          },
        ],
      },
      {
        path: 'edit/:domain',
        component: EditMachineRollComponent,
      },
      {
        path: 'dashboard',
        component: AddDetailsComponent,
      },
      {
        path: 'users-details',
        component: UserDetailsComponent,
      },
      {
        path: 'sign',
        // component:SignComponent,
        children: [
          { path: 'rolling', component: SignRollingDemandComponent},
          { path: 'non-Rolling', component: SignNonRollingDemandComponent},
          { path: 'digital-sign', component: DigitalSignComponent },
          ],
      },
    ],
  },

  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
