import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {interval, merge, Observable, of, pipe, throwError} from 'rxjs';
import {HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, map, mergeMap, take} from 'rxjs/operators';

@Injectable()
export class HttpService {

  constructor(private http: HttpClient) {

  }

  sendModel(data: Node[], file: string, call: boolean = false): Observable<Node[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic dXNlcjpwYXNzd29yZA=='

      })
    };
    return this.http.post<Node[]>(`/api/json?fileName=${file}&call=${call}`, data, httpOptions).pipe(
      catchError(err => throwError(err)));
  }

  getCommands(): Observable<any> {
    let url = 'api/commands';
    return this.http.get(url).pipe(
      catchError(err => of(console.error(err)))
    );
  }

  public getListScenarios(): Observable<any> {
    const url = 'api/models';
    return this.http.get(url).pipe(
      catchError(err => of(console.error(err)))
    );
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
  }

  sendGrammarFile(file: any): Observable<HttpResponse<Object>> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic dXNlcjpwYXNzd29yZA=='
    });
    const httpOptions = {
      headers: headers,
      observe: 'response'
    };
    if (file.size > 0) {
      let formData: FormData = new FormData();
      formData.append('uploadFile', file);
      formData.append('fileName', file.name);
      let headers = new Headers();
      /** In Angular 5, including the header Content-Type can invalidate your request */
      headers.append('Content-Type', 'multipart/form-data');
      headers.append('Accept', 'application/json');
      return this.http.post('/api/grammar/', formData, {observe: 'response'});
    }
  }

  requestModel(file): Observable<any> {
    if (!file) {
      return throwError('Не задано имя файла');

    }
    return this.http.get(`/api/model/${file}`);
  }

  testModel() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic dXNlcjpwYXNzd29yZA=='
      })
    };
    return this.http.post('/api/test',
      [
        {
          'id': 'root',
          'type': 'BranchNode',
          'props': {
            'synthText': 'Как дела?',
            'grammar': 'http://localhost/theme:graph',
            'asrOptions': ''
          },
          'edgeList': [
            {
              'id': 'Node0',
              'match': [
                'привет'
              ]
            },
            {
              'id': 'Node1',
              'match': [
                'пока'
              ]
            }
          ]
        },
        {
          'id': 'Node0',
          'type': 'BranchNode',
          'props': {
            'synthText': '1',
            'grammar': 'http://localhost/theme:graph',
            'asrOptions': ''
          },
          'edgeList': [
            {
              'id': 'Node2',
              'match': [
                'еще'
              ]
            },
            {
              'id': 'Node4',
              'match': [
                'нет'
              ]
            }
          ]
        }]
      , httpOptions);
  }
}
