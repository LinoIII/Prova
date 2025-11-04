import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { ENV } from '../env';
import { FastifyRequest } from 'fastify';

export default fp(async function authPlugin(fastify) {
  fastify.register(jwt, {
    secret: ENV.JWT_SECRET,
    sign: { expiresIn: '8h' } // 8 ore per intranet
  });

  fastify.decorate('authVerify', async function (request: FastifyRequest) {
    try {
      await request.jwtVerify();
    } catch {
      throw { statusCode: 401, message: 'Unauthorized' };
    }
  });
});

