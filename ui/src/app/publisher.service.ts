import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublisherService {

  public status = new ReplaySubject<string>(1);

  constructor() {
    this.status.next('initial');
  }
}
