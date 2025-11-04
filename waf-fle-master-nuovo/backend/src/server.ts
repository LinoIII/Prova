import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import securityPlugin from './plugins/security';
import authPlugin from './plugins/auth';
import { authRoutes } from './auth/routes.auth';
import { eventRoutes } from './events/routes.events';
import { ingestRoutes } from './ingest/routes.ingest';
import { userRoutes } from './users/routes.users';
import { logInfo } from './utils/logger';
import { ENV } from './env';

export async function buildServer() {
  const fastify = Fastify({
    logger: false // usiamo logger custom
  });
  // CORS per permettere frontend su porta diversa

  await fastify.register(cors, {

    origin: ENV.NODE_ENV === 'production'

      ? process.env.CORS_ORIGIN || false

      : true, // In dev permette tutti gli origin

    credentials: true // Permette invio cookie

  });

  // cookie HttpOnly per auth
  await fastify.register(cookie, {
    // secure flag si mette sul singolo cookie quando lo scriviamo
  });

  await fastify.register(securityPlugin);
  await fastify.register(authPlugin);

  // routes
  await fastify.register(authRoutes);
  await fastify.register(eventRoutes);
  await fastify.register(ingestRoutes);
  await fastify.register(userRoutes);

  fastify.get('/health', async () => ({ ok: true }));

  fastify.addHook('onReady', async () => {
    logInfo('server ready');
  });

  return fastify;
}
