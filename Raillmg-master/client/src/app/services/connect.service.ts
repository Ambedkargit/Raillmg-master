// import { Injectable } from '@angular/core';
// import { Subject } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })

// export class ConnectService {
//   setPdfData(pdfString: string) {
//     throw new Error('Method not implemented.');
//   }
//   private pdfSubject = new Subject<any>();

//   constructor() {}

//   sendPdf(pdfData: any) {
//     this.pdfSubject.next(pdfData);
//     console.log(pdfData);
//   }

//   getPdf() {
//     return this.pdfSubject.asObservable();
   
//   }
// }
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectService {
  private pdfData = new BehaviorSubject<string | null>(null);

  constructor() { }

  setPdfData(pdfString: string) {
    this.pdfData.next(pdfString);
  }

  getPdfData() {
    return this.pdfData.asObservable();
  }
}