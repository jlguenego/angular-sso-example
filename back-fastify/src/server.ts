// Require the framework and instantiate it
import f from 'fastify';
import middie from 'middie';
import fastifySession from 'fastify-session';
import fastifyCookie from 'fastify-cookie';
import {sso, UserCredential} from 'node-expose-sspi';
import cors from 'cors';
import {NextHandleFunction} from 'connect';

const fastify = f({logger: true});

// Run the server!
const start = async (): Promise<void> => {
  try {
    fastify.addHook('onRequest', (request, reply, done) => {
      // will be executed before the middie because registered before.
      console.log('request.url', request.url);
      console.log('request.method', request.method);
      done();
    });
    await fastify.register(middie);
    await fastify.register(fastifyCookie);
    await fastify.register(fastifySession, {
      secret: 'this is my secret with more than 32 characters...',
      cookie: {secure: false}, // to work on localhost
    });

    fastify.use(
      cors((req, callback) => {
        const options = {
          credentials: true,
          origin: req.headers.origin,
        };
        callback(null, options);
      }) as NextHandleFunction
    );

    fastify.use('/ws/connect-with-sso', sso.auth({useSession: true}));

    fastify.addHook('preHandler', (request, reply, done) => {
      console.log('preHandler');
      if (!request.url.startsWith('/ws/protected')) {
        console.log('preHandler done');
        done();
        return;
      }
      console.log('check if session');
      if (!request.session?.sso) {
        reply.code(401);
        done(new Error('Authentication error'));
        return;
      }
      done();
    });

    fastify.get('/ws/protected/secret', (request, reply): void => {
      console.log('show the secret');
      reply.send({hello: 'word!'});
    });

    fastify.get('/ws/connect-with-sso', (request, reply): void => {
      console.log('request.raw.sso', request.raw.sso);
      if (!request.raw.sso) {
        console.log('respond 401');
        reply.statusCode = 401;
        reply.send();
        return;
      }
      console.log('connection successfull');
      request.session.sso = request.raw.sso;
      reply.statusCode = 200;
      reply.send({
        sso: request.raw.sso,
      });
    });

    fastify.post('/ws/connect', async (request, reply) => {
      console.log('connect', request.body);
      const domain = sso.getDefaultDomain();
      console.log('domain: ', domain);

      const body = request.body as {login: string; password: string};

      const credentials: UserCredential = {
        domain,
        user: body.login,
        password: body.password,
      };
      console.log('credentials: ', credentials);
      const ssoObject = await sso.connect(credentials);
      console.log('ssoObject: ', ssoObject);
      if (ssoObject && request.session) {
        request.session.sso = ssoObject;
        reply.send({
          sso: request.session.sso,
        });
        return;
      }
      reply.statusCode = 401;
      reply.send({
        error: 'bad login/password.',
      });
    });

    fastify.get('/ws/disconnect', (request, reply) => {
      if (request.session) {
        delete request.session.sso;
      }
      reply.send({});
    });

    fastify.get('/ws/is-connected', (request, reply) => {
      if (request.session?.sso) {
        reply.send({sso: request.session.sso});
        return;
      }
      reply.status(401).send();
    });

    await fastify.listen(3500);
  } catch (err) {
    fastify.log.error(err);
    throw err;
  }
};
start();
