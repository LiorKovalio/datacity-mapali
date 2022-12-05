import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-stage-source',
  templateUrl: './stage-source.component.html',
  styleUrls: ['./stage-source.component.less']
})
export class StageSourceComponent implements OnInit {

  @Input() config: any;
  @Output() updated = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  changed() {
    this.updated.next(this.config);
  }
}
