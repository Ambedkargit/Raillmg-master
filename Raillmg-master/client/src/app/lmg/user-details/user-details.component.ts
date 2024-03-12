import { Component, OnInit, PipeTransform } from '@angular/core';
import { AppService } from '../../app.service';
import { Router } from '@angular/router';
import { localStorageService } from '../../shared/service/local-storage.service';
import { ToastService } from '../../shared/toast/toast.service';
import { IUser } from '../../shared/model/user.model';
import { DecimalPipe, AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbHighlight } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [DecimalPipe, AsyncPipe, ReactiveFormsModule, NgbHighlight],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css',
  providers: [DecimalPipe],
})
export class UserDetailsComponent implements OnInit {
  userData: Partial<IUser>[];
  dataSet: Partial<IUser>[];
  filterTxt = '';
  constructor(
    private service: AppService,
    private toastService: ToastService,
    private router: Router,
    private ls: localStorageService,
    private pipe: DecimalPipe
  ) {
    let user = this.ls.getUser();
    if (user.department !== 'OPERATING') this.router.navigate(['/lmg']);
  }

  ngOnInit() {
    Promise.resolve().then(() => {
      this.service.getAllUser().subscribe((data) => {
        this.userData = data;
        this.dataSet = data;
      });
    });
  }

  filterInput(e) {
    this.filterTxt = e.target.value;
    this.userData = this.dataSet;
    this.userData = this.search(this.filterTxt);
  }

  search(text: string): Partial<IUser>[] {
    if (this.userData === undefined) return [];
    return this.userData.filter((item) => {
      const term = text.toLowerCase();
      return (
        item.username.toLowerCase().includes(term) ||
        item.department.toLowerCase().includes(term) ||
        item.designation.toLowerCase().includes(term)
      );
    });
  }

  onDeleteUser(user) {
    if (
      !confirm('sure want to delete ' + user.username.toUpperCase() + ' USER')
    ) {
      return;
    }
    this.service.deleteUser(user._id).subscribe((res) => {
      const loginUser = this.ls.getUser();
      if (loginUser._id == user._id) {
        this.router.navigate(['login']);
        return;
      }
      this.userData = this.userData.filter((item) => item._id !== user._id);
      this.toastService.showSuccess(' Successfully deleted ');
    });
  }
}
