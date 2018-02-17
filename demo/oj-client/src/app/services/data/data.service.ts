import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { Problem } from '../../models/problem.model';
// import { PROBLEMS } from '../../models/mock-problems';

@Injectable()
export class DataService {
  // problems: Problem[];
  private _problemSource = new BehaviorSubject<Problem[]>([]);
  
  constructor(private http: Http) { }

  // getProblems(): Problem[] {
  //   return this.problems = PROBLEMS;
  // }
  getProblems(): Observable<Problem[]> {
    this.http.get('api/v1/problems')
      .toPromise()
      .then((res: Response) => {
        this._problemSource.next(res.json());
      })
      .catch(this.handleError);
    return this._problemSource.asObservable();
  }

  // getProblem(id: number): Problem {
  //   return this.problems.find((problem) => problem.id === id);
  // }
  getProblem(id: number): Promise<Problem> {
    return this.http.get(`api/v1/problems/${id}`)
            .toPromise()
            .then((res: Response) => res.json())
            .catch(this.handleError);
  }

  // addProblem(problem: Problem) {
  //   problem.id = this.problems.length + 1;
  //   this.problems.push(problem);
  // }
  addProblem(problem: Problem) {
    const headers = new Headers({'content-type': 'application/json'});
    return this.http.post('api/v1/problems', problem, { headers: headers })
            .toPromise()
            .then((res: Response) => {
              this.getProblems();
              return res.json();
            })
            .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.body || error);
  } 
}
