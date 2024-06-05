import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MachinePurseService {
  machinePurseData: {
    machine: string, purse: string 
}[] = [];

  constructor() { }
}