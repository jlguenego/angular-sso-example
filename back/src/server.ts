import express = require('express');
import serveIndex = require('serve-index');
import session = require('express-session');
import {sso, UserCredential} from 'node-expose-sspi';
import cors from 'cors';
import os = require("os");

const app = express();

app.use((req, res, next) => {
  console.log('req.url', req.url);
  console.log('origin', req.headers.origin);
  next();
});

app.use(
  cors((req, callback) => {
    const options = {
      credentials: true,
      origin: 'http://' + req.headers.host?.replace(':3500',':4200')??'',
    };
    callback(null, options);
  })
);

app.use(express.json());
app.use(
  session({
    secret: 'this is my super secreeeeeet!!!!!',
    resave: false,
    saveUninitialized: true,
  })
);

app.use('/mysso/ws/protected', (req, res, next) => {
  if (!req.session?.sso) {
    return res.status(401).end();
  }
  next();
});

app.use('/mysso/ws/protected/secret', (req, res) => {
  res.json({hello: 'word!'});
});

app.use('/mysso/ws/myhost',(req, res) => {
  return res.json({http_host: 'http://' + req.headers.host?.replace(':3500',':4200')??'', machine_host: os.hostname()})
});

app.get('/mysso/ws/connect-with-sso', sso.auth(), (req, res) => {
  console.log('sso method',req.sso.method);
  if (!req.sso) {
    return res.status(401).end();
  }
  if (req.session) {
    req.session.sso = req.sso;
  }
  return res.json({
    sso: req.sso,
  });
});

app.post('/mysso/ws/connect', async (req, res) => {
  console.log('connect login', req.body.login);
  var reqdomain = sso.getDefaultDomain();
  var requser = req.body.login;
  const domainsplit = req.body.login.split('\\');
  if (domainsplit.length > 1) {
	  requser = domainsplit[domainsplit.length - 1];
	  reqdomain = domainsplit[0];
  }
  console.log('req domain: ', reqdomain, 'req user:', requser);

  const credentials: UserCredential = {
    domain: reqdomain,
    user: requser,
    password: req.body.password,
  };
  // console.log('credentials: ', credentials);
  const ssoObject = await sso.connect(credentials);
  //console.log('ssoObject: ', ssoObject);
  if (ssoObject && req.session) {
    req.session.sso = ssoObject;
    return res.json({
      sso: req.session.sso,
    });
  }
  return res.status(401).json({
    error: 'bad login/password.',
  });
});

app.get('/mysso/ws/disconnect', (req, res) => {
  if (req.session) {
    delete req.session.sso;
  }
  return res.json({});
});

app.get('/mysso/ws/is-connected', (req, res) => {
  if (req.session?.sso) {
    return res.json({sso: req.session.sso});
  }
  return res.status(401).end();
});

const www = '../../../front/dist/front';
app.use(express.static(www));
//app.use(serveIndex(www, {icons: true}));

// We need to get the port that IISNode passes into us 
// using the PORT environment variable, if it isn't set use a default value
const port = process.env.PORT || 3500;

app.listen(port, () => console.log('Server started on port ' + port));
