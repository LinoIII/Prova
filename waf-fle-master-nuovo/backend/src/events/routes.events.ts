import { FastifyInstance } from 'fastify';
import { EventQuerySchema } from './dto';

import { requireAuth } from '../middleware/requireAuth';

import { z } from 'zod';

import { prisma } from '../db';

export async function eventRoutes(fastify: FastifyInstance) {

  // GET /events
  fastify.get('/events', { preHandler: [requireAuth] }, async (req, reply) => {
    const parsed = EventQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid query', issues: parsed.error.issues });
    }
    const q = parsed.data;

    const where: any = {};
    if (q.sourceIp) where.sourceIp = q.sourceIp;
    if (q.method) where.method = q.method;
    if (q.action) where.wafAction = q.action;
    if (q.ruleId) where.rule = { ruleId: q.ruleId };
    if (q.uriContains) where.uri = { contains: q.uriContains };

    if (q.fromTs || q.toTs) {
      where.timestamp = {};
      if (q.fromTs) where.timestamp.gte = new Date(q.fromTs);
      if (q.toTs) where.timestamp.lte = new Date(q.toTs);
    }

    const skip = (q.page - 1) * q.limit;

 

    const [events, total] = await Promise.all([

      prisma.event.findMany({

        where,

        skip,

        take: q.limit,

        orderBy: { timestamp: 'desc' },

        include: {

          rule: true,

          assignedTo: { select: { id: true, username: true } }

        }

      }),

      prisma.event.count({ where })

    ]);

 

    reply.send({

      events,

      pagination: {

        page: q.page,

        limit: q.limit,

        total,

        totalPages: Math.ceil(total / q.limit)

      }

    });

  // GET /events/:id
  fastify.get('/events/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        rule: true,
        requestDetail: true,
        assignedTo: { select: { id: true, username: true } }
      }
    });

    if (!event) {
      return reply.code(404).send({ error: 'Not found' });
    }

    reply.send(event);
  });

  // POST /events/:id/assign
  fastify.post('/events/:id/assign', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = z.object({
      analystUserId: z.string().cuid()
    }).safeParse(req.body);

    if (!body.success) {
      return reply.code(400).send({ error: 'Invalid body', issues: body.error.issues });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: { assignedToId: body.data.analystUserId },
      include: {
        assignedTo: { select: { id: true, username: true } }
      }
    });

    reply.send(updated);
  });

// GET /events/stats/overview - Statistiche per dashboard

  fastify.get('/events/stats/overview', { preHandler: [requireAuth] }, async (req, reply) => {

    const now = new Date();

    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

 

    const [

      totalEvents,

      blockedLast24h,

      allowedLast24h,

      topSourceIps,

      topRules,

      eventsByDay

    ] = await Promise.all([

      // Total eventi

      prisma.event.count(),

 

      // Bloccati ultime 24h

      prisma.event.count({

        where: {

          wafAction: 'blocked',

          timestamp: { gte: last24h }

        }

      }),

 

      // Allowed ultime 24h

      prisma.event.count({

        where: {

          wafAction: 'allowed',

          timestamp: { gte: last24h }

        }

      }),

 

      // Top 10 IP sorgenti (ultimi 7 giorni)

      prisma.event.groupBy({

        by: ['sourceIp'],

        where: { timestamp: { gte: last7d } },

        _count: { sourceIp: true },

        orderBy: { _count: { sourceIp: 'desc' } },

        take: 10

      }),

 

      // Top 10 regole triggerate (ultimi 7 giorni)

      prisma.event.groupBy({

        by: ['ruleId'],

        where: {

          timestamp: { gte: last7d },

          ruleId: { not: null }

        },

        _count: { ruleId: true },

        orderBy: { _count: { ruleId: 'desc' } },

        take: 10

      }).then(async (results) => {

        // Recupera dettagli regole

        const ruleIds = results.map(r => r.ruleId).filter((id): id is string => id !== null);

        const rules = await prisma.rule.findMany({

          where: { id: { in: ruleIds } },

          select: { id: true, ruleId: true, message: true, severity: true }

        });

 

        return results.map(r => ({

          ...r,

          rule: rules.find(rule => rule.id === r.ruleId)

        }));

      }),

 

      // Eventi per giorno (ultimi 7 giorni)

      prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`

        SELECT DATE(timestamp) as date, COUNT(*)::bigint as count

        FROM "Event"

        WHERE timestamp >= ${last7d}

        GROUP BY DATE(timestamp)

        ORDER BY date DESC

      `

    ]);

 

    reply.send({

      totalEvents,

      last24h: {

        blocked: blockedLast24h,

        allowed: allowedLast24h,

        total: blockedLast24h + allowedLast24h

      },

      topSourceIps: topSourceIps.map(ip => ({

        sourceIp: ip.sourceIp,

        count: ip._count.sourceIp

      })),

      topRules: topRules.map(r => ({

        ruleId: r.ruleId,

        count: r._count.ruleId,

        rule: r.rule

      })),

      eventsByDay: eventsByDay.map(d => ({

        date: d.date,

        count: Number(d.count)

      }))

    });

  });
}
  )};
