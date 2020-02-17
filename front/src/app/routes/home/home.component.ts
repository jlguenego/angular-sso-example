import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  secret = '';
  constructor(public user: UserService) {}

  ngOnInit(): void {
    this.secret = '';
  }

  async disconnect() {
    this.secret = '';
    await this.user.disconnect();
  }

  async showSecret() {
    try {
      const data = await this.user.showSecret();
      this.secret = JSON.stringify(data);
    } catch (e) {
      alert(e.msg);
    }
  }
}
