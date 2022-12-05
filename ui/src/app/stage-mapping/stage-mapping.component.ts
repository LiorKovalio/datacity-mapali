import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-stage-mapping',
  templateUrl: './stage-mapping.component.html',
  styleUrls: ['./stage-mapping.component.less']
})
export class StageMappingComponent implements OnChanges {

  @Input() config: any;
  @Output() updated = new EventEmitter<any>();

  FIELDS: {ct: string, h: string[]}[] = [
    {ct: 'location:lat', h: ['lat', 'latitude', 'y', 'Y']},
    {ct: 'location:lon', h: ['lon', 'lng', 'longitude', 'x', 'X']},
    {ct: 'address:full', h: ['address', 'כתובת', 'כתובת מלאה']},
  ];
  COLUMN_TYPES = [
    'name', 'location:lat', 'location:lon', 'address:full',
  ];
  once = false;
  columnTypeMapping: any = {};

  constructor() {}

  ngOnChanges(): void {
    if (this.config && !this.once) {
      this.once = true;
      const mapping = this.config.model?.mapping || [];
      let changed = false;
      for (const {ct, h} of this.FIELDS) {
        let foundForCt = false;
        for (const header of h) {
          for (const m of mapping) {
            if (m.name === header) {
              if (m.columnType !== ct) {
                m.columnType = ct;
                changed = true;  
              }
              foundForCt = true;
              break;
            }
          }
          if (foundForCt) {
            break;
          }
        }
      }
      if (changed) {
        this.changed();
      }
    }
    this.columnTypeMapping = {};
    this.COLUMN_TYPES.forEach((ct) => {
      this.config.model?.mapping?.forEach((m: any) => {
        if (m.columnType === ct) {
          this.columnTypeMapping[ct] = m.name;
        }
      });
    });
    console.log('MM columnTypeMapping', this.columnTypeMapping);
  }

  updateMapping() {
    console.log('MM UPDATE MAPPING');
    this.COLUMN_TYPES.forEach((ct) => {
      const name = this.columnTypeMapping[ct];
      if (name) {
        this.config.model?.mapping?.forEach((m: any) => {
          if (m.columnType === ct) {
            m.columnType = null;
          }
          if (m.name === name) {
            m.columnType = ct;
          }
        });  
      }
    });
    this.changed();
  }

  changed() {
    this.updated.next(this.config);
  }
}
