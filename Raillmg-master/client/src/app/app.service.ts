import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  getTimelossData(subsec: string) {
    throw new Error('Method not implemented.');
  }
  saveDataToMongo(data: any[]): Observable<any> {
    return this.httpClient.post(`${this.API_HOST}/save-data`, data);
  }
  submitRollingDemand(payload: any[]) {
    throw new Error('Method not implemented.');
  }
  // API_HOST = 'https://raillmg-server.onrender.com/api';
   API_HOST = '/api';
    // API_HOST = 'http://localhost:3000/api';

  isLoading$ = new Subject<boolean>();
  http: any;
  baseUrl: any;

  constructor(private httpClient: HttpClient) {}

// Method to add machine and purse data
addMachineAndPurse(data): Observable<any> {
  return this.httpClient.post(`${this.API_HOST}/machine-purse`, data);
}

// Method to fetch all machine and purse data
getAllMachineAndPurse(): Observable<any> {
  return this.httpClient.get(`${this.API_HOST}/machine-purse`);
}
updateMachineAndPurse(id: string, purse: string): Observable<any> {
  return this.http.put(`${this.baseUrl}/machine-purse/${id}`, { purse });
}

  loginUser(username, password): Observable<any> {
    return this.httpClient.get<any>(
      `${this.API_HOST}/users?username=${username}&password=${password}`
    );
  }
  getAllUser(): Observable<any> {
    return this.httpClient.get<any>(`${this.API_HOST}/users/allUsers`);
  }

  deleteUser(id): Observable<any> {
    return this.httpClient.delete<any>(`${this.API_HOST}/users/${id}`);
  }

  updateUser(id, data): Observable<any> {
    return this.httpClient.patch<any>(`${this.API_HOST}/users/${id}`, data);
  }

  register(data): Observable<any> {
    return this.httpClient.post(this.API_HOST + '/users', data);
  }

  getAllMachineRoll(url): Observable<any> {
    return this.httpClient.get(`${this.API_HOST}/${url}`);
  }

  getRailDetails(id): Observable<any> {
    return this.httpClient.get(`${this.API_HOST}/railDetails/${id}`);
  }

  getAllRailDetails(url): Observable<any> {
    return this.httpClient.get(`${this.API_HOST}/${url}`);
  }

  addRailDetails(url, data): Observable<any> {
    return this.httpClient.post(`${this.API_HOST}/${url}`, data);
  }

  updateRailDetails(url, id, data): Observable<any> {
    return this.httpClient.patch(`${this.API_HOST}/${url}/${id}`, data);
  }
  deleteRailDetails(url, id): Observable<any> {
    return this.httpClient.delete(`${this.API_HOST}/${url}/${id}`);
  }

}
