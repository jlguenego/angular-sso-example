import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface User {
  name: string;
}

interface SSOOjbect {
  user: User;
}

interface ConnectWithSSOResponse {
  sso: SSOOjbect;
}

const domainUrl = 'http://localhost:3500';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  isConnected = false;
  content: object | undefined;
  constructor(private http: HttpClient) {
    this.checkConnection();
  }

  async checkConnection(): Promise<void> {
    try {
      const { sso } = await this.http
        .get<ConnectWithSSOResponse>(domainUrl + '/ws/is-connected', {
          withCredentials: true,
        })
        .toPromise();
      console.log('sso', sso);
      this.isConnected = true;
      this.content = sso.user;
    } catch (e) {
      this.content = undefined;
    }
  }

  async connectWithSSO(): Promise<void> {
    try {
      const { sso } = await this.http
        .get<ConnectWithSSOResponse>(domainUrl + '/ws/connect-with-sso', {
          withCredentials: true,
        })
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

  async connect(f: { login: string; password: string }): Promise<void> {
    try {
      const { sso } = await this.http
        .post<ConnectWithSSOResponse>(domainUrl + '/ws/connect', f, {
          withCredentials: true,
        })
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

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.content = undefined;
    try {
      await this.http
        .get(domainUrl + '/ws/disconnect', {
          withCredentials: true,
        })
        .toPromise();
    } catch (error) {
      console.error('error', error);
    }
  }

  async showSecret(): Promise<object> {
    try {
      const secret = await this.http
        .get<object>(domainUrl + '/ws/protected/secret', {
          withCredentials: true,
        })
        .toPromise();
      return secret;
    } catch (e) {
      throw { msg: 'You probably need to be connected to see my secret' };
    }
  }
}
