import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AppService } from '../app.service';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../shared/toast/toast.service';
import { localStorageService } from '../shared/service/local-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  userForm!: FormGroup;
  constructor(
    private service: AppService,
    private ls: localStorageService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userForm = new FormGroup({
      username: new FormControl(null),
      password: new FormControl(null),
      newPassword: new FormControl(null),
      confirmPassword: new FormControl(null),
    });
  }
  onLogin() {
    this.service.isLoading$.next(true);
    this.service
      .loginUser(this.userForm.value.username, this.userForm.value.password)
      .subscribe({
        next: (data) => {
          this.ls.setUser(data);
          this.router.navigate(['/lmg']);
        },
       
        error: (err) => {
          this.service.isLoading$.next(false);
          this.toastService.showDanger('failed to login');
        },
      });
      // if(this.userForm.value.userDepartment === 'ENGINEERING'){
      //   document.addEventListener('DOMContentLoaded', function() {
      //     const showAlert: string | null = sessionStorage.getItem('showAlert');
      //     if (showAlert === 'true') {
      //         alert('You are required for the block demand');
      //         sessionStorage.removeItem('showAlert'); // Remove the item from session storage after displaying the alert
      //     }
      // });
      // }
  }
  resetPassword() {
    if (!this.userForm.valid) {
      this.toastService.showWarning('fill all details');
      return;
    }
    if (
      this.userForm.value.confirmPassword !== this.userForm.value.newPassword
    ) {
      this.toastService.showDanger('CONFORM PASSWORD INCORRECT');
      return;
    }

    this.service.isLoading$.next(true);
    this.service
      .loginUser(this.userForm.value.username, this.userForm.value.password)
      .subscribe({
        next: (data) => {
          const payload = {
            password: this.userForm.value.newPassword,
          };
          this.service.updateUser(data._id, payload).subscribe((res) => {
            this.toastService.showSuccess('successfully RESET');
            this.userForm.reset();
          });
        },
        error: (err) => {
          this.service.isLoading$.next(false);
          this.toastService.showDanger('no user found');
        },
      });
  }
}
