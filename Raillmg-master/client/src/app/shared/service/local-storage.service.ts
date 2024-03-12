import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { IUser } from '../model/user.model';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class localStorageService {
    private KEY_USER = 'user'
    isUserLoggedIn = new Subject<boolean>()

    constructor(@Inject(PLATFORM_ID) private platform: object) { }

    getUser(): IUser {
        if (!isPlatformBrowser(this.platform)) {
            return {} as IUser;
        }
        return JSON.parse(localStorage.getItem(this.KEY_USER)) as IUser
    }

    setUser(data: IUser) {
        this.isUserLoggedIn.next(true)
        localStorage.setItem(this.KEY_USER, JSON.stringify(data))
    }

    removeUser() {
        this.isUserLoggedIn.next(false)
        localStorage.removeItem(this.KEY_USER);
    }


}