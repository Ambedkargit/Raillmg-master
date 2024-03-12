import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgbToastModule],
  templateUrl: './toast.component.html',
  host: { class: 'toast-container position-fixed top-0 end-0 p-3', style: 'z-index: 1200' },
  styleUrl: './toast.component.css'
})
export class ToastComponent {

  constructor(public toastService: ToastService) { }

}
