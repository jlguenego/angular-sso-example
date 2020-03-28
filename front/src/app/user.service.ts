import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface User {
}

interface SSOOjbect {
  user: User;
}

interface ConnectWithSSOResponse {
  sso: SSOOjbect;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  isConnected = false;
  content: any;
  constructor(private http: HttpClient) {
    this.checkConnection();
  }

  async checkConnection() {
    try {
      const { sso } = await this.http
        .get<ConnectWithSSOResponse>('/ws/is-connected')
        .toPromise();
      console.log('sso', sso);
      this.isConnected = true;
      this.content = sso.user;
    } catch (e) {
      this.content = undefined;
    }
  }

  async connectWithSSO() {
    try {
      const { sso } = await this.http
        .get<ConnectWithSSOResponse>('/ws/connect-with-sso')
        .toPromise();
      console.log('sso', sso);
      this.isConnected = true;
      this.content = sso.user;
    } catch (error) {
      console.error('error', error);
      this.isConnected = false;
      this.content = undefined;
      throw error;
    }
  }

  async connect(f: { login: string; password: string }) {
    try {
      const { sso } = await this.http
        .post<ConnectWithSSOResponse>('/ws/connect', f)
        .toPromise();
      console.log('sso', sso);
      this.isConnected = true;
      this.content = sso.user;
    } catch (error) {
      console.error('error', error);
      this.isConnected = false;
      this.content = undefined;
      throw error;
    }
  }

  async disconnect() {
    this.isConnected = false;
    this.content = undefined;
    try {
      await this.http.get('/ws/disconnect').toPromise();
    } catch (error) {
      console.error('error', error);
    }
  }

  async showSecret() {
    try {
      const secret = await this.http.get('/ws/protected/secret').toPromise();
      return secret;
    } catch (e) {
      throw { msg: 'You probably need to be connected to see my secret' };
    }
  }
}
