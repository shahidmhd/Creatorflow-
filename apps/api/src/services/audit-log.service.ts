import { prisma } from "../repositories/prisma";

export const auditLogService = {
  async log(
    actorId: string | null,
    action: string,
    entity: string,
    entityId: string | null,
    oldValue: unknown,
    newValue: unknown,
    metadata?: Record<string, unknown>
  ) {
    try {
      return await prisma.auditLog.create({
        data: {
          actorId: actorId ?? undefined,
          action,
          entity,
          entityId: entityId ?? undefined,
          oldValue: oldValue ? (oldValue as object) : undefined,
          newValue: newValue ? (newValue as object) : undefined,
          metadata: metadata ? (metadata as object) : undefined,
        },
      });
    } catch (err) {
      console.error("Audit log error:", err);
      return null;
    }
  },

  async findAll(filters: { entity?: string; actorId?: string; page?: number; limit?: number }) {
    const { entity, actorId, page = 1, limit = 50 } = filters;
    const where = {
      ...(entity && { entity }),
      ...(actorId && { actorId }),
    };
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { logs, total, page, limit };
  },
};
