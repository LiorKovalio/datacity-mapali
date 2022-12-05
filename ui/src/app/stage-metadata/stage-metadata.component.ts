import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-stage-metadata',
  templateUrl: './stage-metadata.component.html',
  styleUrls: ['./stage-metadata.component.less']
})
export class StageMetadataComponent implements OnChanges {

  @Input() config: any;
  @Output() updated = new EventEmitter<any>();

  constructor() { }

  ngOnChanges() {
    this.config.package = this.config.package || {};
  }

  changed() {
    this.updated.next(this.config);
  }
}
