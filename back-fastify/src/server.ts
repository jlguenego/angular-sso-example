// Require the framework and instantiate it
import f from 'fastify';
import middie from 'middie';
import {ServerResponse, IncomingMessage} from 'http';
import {sso} from 'node-expose-sspi';
import {NextFunction} from 'node-expose-sspi/dist/sso/interfaces';

const fastify = f({logger: true});

// Run the server!
const start = async (): Promise<void> => {
  try {
    await fastify.register(middie);
    fastify.use(
      (req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
        console.log('req.url', req.url);
        next();
      }
    );
    fastify.use(sso.auth());
    // Declare a route
    fastify.get('/', (request, reply): void => {
      reply.send({sso: request.raw.sso});
    });
    await fastify.listen(3000);
  } catch (err) {
    fastify.log.error(err);
    throw err;
  }
};
start();
