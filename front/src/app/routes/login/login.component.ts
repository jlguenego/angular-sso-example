import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/user.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  error = '';

  f = new FormGroup({
    login: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(public user: UserService, private router: Router) {}

  ngOnInit(): void {}

  async connectWithSSO(): Promise<void> {
    try {
      await this.user.connectWithSSO();
      this.router.navigateByUrl('/welcome');
    } catch (e) {
      this.router.navigateByUrl('/no-sso');
    }
  }

  async submit(): Promise<void> {
    this.error = '';
    console.log('submit');
    try {
      await this.user.connect(this.f.value);
      this.router.navigateByUrl('/welcome');
    } catch (e) {
      console.log('e: ', e);
      this.error = e.error.error;
    }
  }
}
