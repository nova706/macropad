import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { App } from './interfaces/app';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    apiUrl = 'api/';

    constructor(private http: HttpClient) { }

    getMacros(): Observable<App[]> {
        return this.http.get<App[]>(this.apiUrl);
    }

    saveMacros(macros: App[]): Observable<App[]> {
        return this.http.put<App[]>(this.apiUrl, macros);
    }
}
