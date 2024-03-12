// sign.component.ts
// import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
// import { Subscription } from 'rxjs';
// import { ConnectService } from '../../services/connect.service';

// @Component({
//   selector: 'app-sign',
//   templateUrl: './sign.component.html',
//   styleUrls: ['./sign.component.css'],
// })
// export class SignComponent implements OnDestroy {
//   pdfData: any;
//   private pdfSubscription: Subscription;

//   @ViewChild('pdfViewer') pdfViewer: ElementRef;

//   constructor(private connect: ConnectService) {
//     this.pdfSubscription = this.connect.getPdf().subscribe(data => {
//       this.pdfData = data;
//       this.displayFile();
  
//     });
//   }

//   ngOnDestroy() {
//     this.pdfSubscription.unsubscribe();
//   }

//   displayFile() {
//     if (this.pdfData) {
//       const blobUrl = URL.createObjectURL(this.pdfData);
//       this.pdfViewer.nativeElement.src = blobUrl;
//     } else {
//       console.error('PDF data is null.');
//     }
//   }
// }


import { Component,OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConnectService } from '../../services/connect.service';
import { PDFDocument, rgb } from 'pdf-lib';
@Component({
  selector: 'app-sign',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sign.component.html',
  styleUrl: './sign.component.css'
})
export class SignComponent implements OnInit {
  pdfData: SafeResourceUrl | null = null;
  signedPdfData: SafeResourceUrl | null = null;
  Font: any;

  constructor(
    private connect: ConnectService,
    private sanitizer: DomSanitizer
    
  ) { }

  ngOnInit(): void {
    this.connect.getPdfData().subscribe(data => {
      if (data) {
        this.pdfData = this.sanitizer.bypassSecurityTrustResourceUrl(data);
      } else {
        this.pdfData = null;
      }
    });
  }
  async signPdf() {
    try {
      if (!this.pdfData) throw new Error('PDF data is not available.');
  
      const pdfBytes = await this.fetchPdfBytes(this.pdfData);
      if (!pdfBytes) throw new Error('Failed to fetch PDF bytes.');
  
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
  
      // Add signature text
      firstPage.drawText('Your Digital Signature Text', {
        x: 50,
        y: 50,
        size: 24,
        color: rgb(1, 0, 0) // Red color
      });
  
      // Update the PDF Data after signing
      const updatedPdfBytes = await pdfDoc.save();
      const updatedPdfData = new Blob([updatedPdfBytes], { type: 'application/pdf' });
      this.signedPdfData = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(updatedPdfData));
      
    } catch (error) {
      console.error('Error signing PDF:', error);
    }
  }
  
  async fetchPdfBytes(url: SafeResourceUrl): Promise<Uint8Array | null> {
    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error('Error fetching PDF:', error);
      return null;
    }
  }
  
  
}