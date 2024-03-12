import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpHandler, HttpRequest, HttpEventType
} from '@angular/common/http';
import { tap } from 'rxjs';
import { AppService } from './app.service';


@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {
  constructor(private service: AppService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    this.service.isLoading$.next(true)
    return next.handle(req).pipe(tap(event => {
      if (event.type === HttpEventType.Response) {
        this.service.isLoading$.next(false)
        console.log(req.url, 'returned a response with status', event.status);
      }
    }));;
  }
}