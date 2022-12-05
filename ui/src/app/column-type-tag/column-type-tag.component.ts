import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-column-type-tag',
  templateUrl: './column-type-tag.component.html',
  styleUrls: ['./column-type-tag.component.less'],
  host: {
    '[class.tag]': 'found'
  }
})
export class ColumnTypeTagComponent implements OnChanges {

  @Input() columnType: string;
  @Input() taxonomy: any;

  title = '';
  found = false;

  constructor() { }

  ngOnChanges(): void {
    this.found = false;
    const cts = this.taxonomy?.columnTypes;
    this.title = this.columnType;
    if (cts && this.columnType) {
      const mod = this.columnType.split('-').join(':');
      const ct = cts.find((ct: any) => ct.name === this.columnType || ct.name === mod);
      if (ct) {
        this.title = ct.title;
        this.found = true;
      }
    }
  }

}
