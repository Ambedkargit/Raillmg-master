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
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class ConnectService {
  // private pdfData = new BehaviorSubject<string | null>(null);

  // constructor() { }

  // setPdfData(pdfString: string) {
  //   this.pdfData.next(pdfString);
  // }

  // getPdfData() {
  //   return this.pdfData.asObservable();
  // }
  import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConnectService {
  private timelossData: { [section: string]: { [subsection: string]: number } } = {};
  private totalEnggData: { [section: string]: number } = {};

  constructor() { 
    // Retrieve data from local storage if available
    const storedData = localStorage.getItem('connectServiceData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      this.timelossData = parsedData.timelossData || {};
      this.totalEnggData = parsedData.totalEnggData || {};
    }
  }

  setTimelossData(section: string, subsection: string, data: number) {
    if (!this.timelossData[section]) {
      this.timelossData[section] = {};
    }
    if (!this.timelossData[section][subsection]) {
      this.timelossData[section][subsection] = 0;
    }
    // Subtract previous time loss for this subsection from total engineering data
    if (this.totalEnggData[section]) {
      this.totalEnggData[section] -= this.timelossData[section][subsection];
    }
    // Update time loss data
    this.timelossData[section][subsection] = data;
    // Update total engineering data
    this.totalEnggData[section] = Object.values(this.timelossData[section]).reduce((acc, curr) => acc + curr, 0);
    
    // Update localStorage
    localStorage.setItem('connectServiceData', JSON.stringify({
      timelossData: this.timelossData,
      totalEnggData: this.totalEnggData
    }));
  }

  getTimelossData(section: string): number {
    const subsections = this.timelossData[section];
    if (!subsections) return 0;
    return Object.values(subsections).reduce((acc, curr) => acc + curr, 0);
  }

  getTotalEnggData(section: string): number {
    return this.totalEnggData[section] || 0;
  }

  resetData() {
    // Reset timelossData and totalEnggData
    this.timelossData = {};
    this.totalEnggData = {};
    
    // Update localStorage
    localStorage.setItem('connectServiceData', JSON.stringify({
      timelossData: this.timelossData,
      totalEnggData: this.totalEnggData
    }));
  }
}
