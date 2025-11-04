import { ENV } from './env';
import { buildServer } from './server';
import { logInfo, logError } from './utils/logger';

async function main() {
  try {
    const fastify = await buildServer();
    await fastify.listen({ port: ENV.PORT, host: '0.0.0.0' });
    logInfo(`listening on ${ENV.PORT}`);
  } catch (err) {
    logError('failed to start', { err });
    process.exit(1);
  }
}

main();
