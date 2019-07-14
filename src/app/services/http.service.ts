import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModelService } from './model.service';
import { catchError, retry } from 'rxjs/operators';
import { Node } from '../graph/nodes/nodes';

@Injectable()
export class HttpService {

    constructor(private http: HttpClient) {

    }
    sendModel(data: Node[]): Observable<Node[]> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Basic dXNlcjpwYXNzd29yZA=='
            })
        };
        return this.http.post<Node[]>('https://192.168.1.74:8080/api/json/', data, httpOptions);
            // .pipe(catchError(this.handleError));
    }
    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', error.error.message);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          console.error(
            `Backend returned code ${error.status}, ` +
            `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return throwError(
          'Something bad happened; please try again later.');
      };
}