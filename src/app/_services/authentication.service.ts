import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { APP_CONSTANTS } from '../_core/constant';
import { LoginResponse } from '../../../dotnet/openapi';

@Injectable({
    providedIn: 'root', 
})
export class AuthenticationService {
    defaultProfile: LoginResponse | undefined
    _userDetailsListener = new BehaviorSubject<any>(false);
    userDetailsListener$ = this._userDetailsListener.asObservable();
    _userLocationListener = new BehaviorSubject<any>(null);
    userLocationListener$ = this._userLocationListener.asObservable();
    _loginListener = new BehaviorSubject<boolean>(false);
    loginListener$ = this._loginListener.asObservable();
    today: Date = new Date();
    tokenExpirationTimer: any;
    accessToken: string | null | undefined;
    superAdminLogin = false;
    configuration: any;
    get isSuperAdminLogin() {
        return this.superAdminLogin;
    }
    constructor(
        private _router: Router
    ) { }


    public getToken(): string | null {
        return localStorage.getItem('token');
    }

    get storage(): Storage {
        return localStorage;
    }

    autoLogout(expirationDuration: number): void {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
            alert('Session Timed Out! Please Login');
        }, expirationDuration);
    }

    handleUserAuthentication(): void {
        if (localStorage.getItem('userData')) {
            const userLoginData: any = JSON.parse(
                localStorage.getItem('userData') ?? ''
            );
            try {
                if (userLoginData.expiresIn && userLoginData.accessToken) {
                    // const expirationDuration =
                    //     userLoginData.expiresIn - this.today.getTime();
                    // this.autoLogout(expirationDuration);
                    this.accessToken = userLoginData.accessToken;
                    if (this.accessToken) {
                        const data = this.parseJwt(this.accessToken);
                        this.superAdminLogin = data.role === APP_CONSTANTS.ROLES.SUPER_ADMIN;
                        const loadedUser: any = {
                            accessToken: userLoginData.accessToken,
                            expiresIn: userLoginData.expiresIn,
                            refreshToken: userLoginData.refreshToken,
                            tokenType: userLoginData.tokenType,
                            name: userLoginData.name,
                        };
                        this._userDetailsListener.next(loadedUser);
                        this._loginListener.next(this.isSuperAdminLogin);
                    } else {
                        this._loginListener.next(false);
                    }
                } else {
                    this._loginListener.next(false);
                    this._userDetailsListener.next(this.defaultProfile);
                }
            } catch (error) {
                this._loginListener.next(false);
                this._userDetailsListener.next(this.defaultProfile);
            }
        }
    }

    private parseJwt(token: string): any {
        const base64Url = token.split('.')[1];
        const base64 = decodeURIComponent(
            window
                .atob(base64Url)
                .split('')
                .map((c) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        const res = JSON.parse(base64) as UserToken;
        return res;
    }





    logout(): void {
        localStorage.removeItem('userData');
        this.superAdminLogin = false;
        this._loginListener.next(false);
        // this._userDetailsListener.next(null);
        this.handleUserAuthentication();
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
        this._router.navigateByUrl('');
    }

}



export class UserToken {
    roles: string | undefined;
}




