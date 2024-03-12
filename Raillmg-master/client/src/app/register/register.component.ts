import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppService } from '../app.service';
import { localStorageService } from '../shared/service/local-storage.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  constructor(
    private service: AppService,
    private ls: localStorageService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.registerForm = new FormGroup({
      username: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
      // email: new FormControl(null, Validators.required),
      designation: new FormControl(null, Validators.required),
      department: new FormControl(null, Validators.required),
      // mobile: new FormControl(null, Validators.required)
    });
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.service.register(this.registerForm.value).subscribe((data) => {
        this.ls.setUser(data);
        this.router.navigate(['/lmg']);
      });
    }
  }
}
