import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AppService } from '../../app.service';
import { localStorageService } from '../service/local-storage.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  userData = {}
  selectedFileName: any;
  constructor(
    private ls: localStorageService,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.userData = this.ls.getUser()
  }
  
  onLogout() {
    this.ls.removeUser()
    this.router.navigate(['/login'])
  }
}
