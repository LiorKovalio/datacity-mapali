import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { StoreService } from 'etl-server';
import { WorkbenchService } from 'etl-server';
import { delay, tap, timer } from 'rxjs';
import { PublisherService } from '../publisher.service';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.less']
})
export class DrawerComponent implements OnInit {

  @Output() mapConfig = new EventEmitter<any>();
  loggedIn = false;
  fileSelected = false;

  config: any = {};
  rows: any[][] = [];
  valid: boolean[] = [];
  headers: string[][] = [];
  selectedKind = 0;
  processing = false;
  processingRevision = 0;

  constructor(private store: StoreService, private workbench: WorkbenchService, private publisher: PublisherService) {
    store.getConfig().pipe(
      tap((config) => {
        this.config = config;
        this.config.source = this.config.source || {};
        this.config.loader = this.config.loader || {};
        this.config.taxonomy = this.config.taxonomy || {};
        if (this.config.taxonomy.options?.length) {
          this.config.taxonomy.id = this.config.taxonomy.options[0].id;
        }
        if (config.revision > this.processingRevision) {
          this.processing = false;
        }
      }),
      delay(0),
      tap((config) => {
        this.updateConfig(config);
      })
    ).subscribe((config) => {
      console.log('CCConfig', config);
    });
    store.getRows().subscribe((row) => {
      // console.log('RRR0', row.kind, row.index, row.data);
      if (row?.kind === undefined || row?.kind === -1) {
        this.rows = [[],[],[]];
        this.headers = [[],[],[]];
        this.valid = [true, false, false];
      } else {
        const kind = row.kind;
        if (row.index === -1) {
          this.headers[kind] = ['#', ...row.data];
        }
        if (row.index === -2) {
          this.valid[kind] = !!this.rows[kind]?.length;
          if (kind > this.selectedKind && this.valid[kind]) {
            this.selectedKind = kind;
          }
          this.rows[kind] = this.rows[kind]?.slice() || [];
          if (kind === 2 && this.config.mapPath && this.rows[kind].length) {
            if (this.processing) {
              this.publisher.status.next('done');
            } else {
              this.publisher.status.next('ready');
            }
            this.mapConfig.emit({mapPath: this.config.mapPath});  
          }
        }
        if (row.index >= 0 && this.rows[kind]) {
          this.rows[kind].push(Object.assign({'#': row.index + 1}, row.data));
        }
        // console.log('RRR', kind, row.index,  this.rows[kind]?.length, row.data);
      }
      // if (!row.index || row.index < 0) {
      //   console.log('RRR', row);
      // }
      // if (row.index === -2) {
      //   if (this.hasErrors) {
      //     this.complete = 'errors';
      //   } else {
      //     this.complete = row.kind === 2 ? 'complete' : 'incomplete';
      //   }
      // } else if (row.kind === -1) {
      //   this.complete = 'progress';
      //   this.hasErrors = false;
      // } else if (row.errors && row.errors.length > 0) {
      //   this.hasErrors = true;
      // }
    });
    this.publisher.status.subscribe((status) => {
      if (status === 'processing') {
        console.log('MAP Publish allowed');
        this.config['publish'] = {allowed: true};
        this.updateConfig(this.config);
        this.processingRevision = this.config.revision;
        this.processing = true;
      }
    });
  }

  ngOnInit(): void {
  }

  updateConfig(config: any) {
    this.store.setConfig(config ? Object.assign({}, this.store.BASE_CONFIG, config) : this.config);
  }

  processCell(val: any): string {
    if (val === undefined || val === null) {
      return '';
    }
    if (val['type{decimal}']) {
      val = val['type{decimal}'];
    }
    if (val.indexOf && val.indexOf('.') >= 0) {
      try {
        const f = parseFloat(val);
        if (Number.isFinite(f)) {
          return f.toFixed(5);
        }
      } catch (e) {
      }
    } else {
      try {
        const i: number = parseInt(val, 10);
        if (Number.isFinite(i)) {
          return i.toLocaleString();
        }
      } catch(e) {
      }  
    }  
    return val.toString();
  }
}
