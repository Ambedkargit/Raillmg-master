import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  // API_HOST = 'https://raillmg-server.onrender.com/api';
    API_HOST = '/api';
    // API_HOST = 'http://localhost:3000/api';

  isLoading$ = new Subject<boolean>();

  constructor(private httpClient: HttpClient) {}

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
