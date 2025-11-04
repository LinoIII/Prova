import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

export default fp(async function securityPlugin(fastify) {
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: true
    }
  });

  await fastify.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute'
  });
});
