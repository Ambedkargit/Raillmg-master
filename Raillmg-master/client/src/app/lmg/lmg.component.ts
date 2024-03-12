import { Component } from '@angular/core';
import { NavbarComponent } from "../shared/navbar/navbar.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-lmg',
  standalone: true,
  templateUrl: './lmg.component.html',
  styleUrl: './lmg.component.css',
  imports: [NavbarComponent, RouterOutlet]
})
export class LmgComponent {

}
