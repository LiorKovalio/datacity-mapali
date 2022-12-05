import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ApiService } from 'etl-server';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  @Output() login = new EventEmitter<boolean>();

  constructor(public api: ApiService) { }

  ngOnInit(): void {
    this.api.token.subscribe((token) => {
      if (token) {
        this.login.next(true);
      }
    });
  }

  login_href() {
    if (this.api.providers) {
      if (this.api.providers.google) {
        return this.api.providers.google.url;
      } else if (this.api.providers.github) {
        return this.api.providers.github.url;
      }
    }
    return '#';
  }

}
