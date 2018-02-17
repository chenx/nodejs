import { Component, OnInit } from '@angular/core';
import { Problem } from '../../models/problem.model';
import { ActivatedRoute, Params } from '@angular/router';
import { DataService } from '../../services/data/data.service';

@Component({
  selector: 'app-problem-detail',
  templateUrl: './problem-detail.component.html',
  styleUrls: ['./problem-detail.component.css']
})
export class ProblemDetailComponent implements OnInit {
  problem: Problem;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      // this.problem = this.dataService.getProblem(+params['id']);
      this.dataService.getProblem(+params['id'])
        .then(problem => this.problem = problem);
    });
  }

}
