import { CommonModule, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent {}
