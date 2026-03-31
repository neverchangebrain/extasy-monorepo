import {
  and,
  db,
  desc,
  eq,
  isNull,
  personal,
  staffAssignments,
  staffBranchCode,
  staffBranches,
  staffGlobalBlacklists,
} from "@extasy/db";

import {
  BRANCH_ROLES,
  GLOBAL_ROLES,
  MANAGEMENT_ROLES,
  ROLE_WEIGHT,
  type StaffBranchCode,
  type StaffRole,
} from "@constants/team";

export class TeamServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TeamServiceError";
  }
}

const now = () => new Date();

export const TeamService = {
  async getActiveAssignments(userId: string) {
    return db
      .select()
      .from(staffAssignments)
      .where(
        and(
          eq(staffAssignments.userId, userId),
          eq(staffAssignments.active, true),
        ),
      )
      .orderBy(desc(staffAssignments.createdAt));
  },

  async getProfile(userId: string) {
    const assignments = await this.getActiveAssignments(userId);
    const [globalBlacklist] = await db
      .select()
      .from(staffGlobalBlacklists)
      .where(
        and(
          eq(staffGlobalBlacklists.userId, userId),
          eq(staffGlobalBlacklists.active, true),
        ),
      )
      .limit(1);

    return { assignments, globalBlacklist };
  },

  async listBranches() {
    return db
      .select()
      .from(staffBranches)
      .where(eq(staffBranches.isActive, true))
      .orderBy(staffBranches.name);
  },

  async assignBranchRole(input: {
    actorUserId: string;
    targetUserId: string;
    role: StaffRole;
    branchCode: StaffBranchCode;
    reason?: string;
    targetDisplayName?: string;
  }) {
    if (!BRANCH_ROLES.includes(input.role)) {
      throw new TeamServiceError(
        "Для назначения на ветку доступны только branch-роли.",
      );
    }

    const [branch] = await db
      .select()
      .from(staffBranches)
      .where(
        and(
          eq(
            staffBranches.code,
            input.branchCode as (typeof staffBranchCode.enumValues)[number],
          ),
          eq(staffBranches.isActive, true),
        ),
      )
      .limit(1);

    if (!branch) {
      throw new TeamServiceError("Ветка не найдена или отключена.");
    }

    const actorAssignments = await this.getActiveAssignments(input.actorUserId);
    const targetAssignments = await this.getActiveAssignments(
      input.targetUserId,
    );

    const [globalBlacklist] = await db
      .select()
      .from(staffGlobalBlacklists)
      .where(
        and(
          eq(staffGlobalBlacklists.userId, input.targetUserId),
          eq(staffGlobalBlacklists.active, true),
        ),
      )
      .limit(1);

    if (globalBlacklist) {
      throw new TeamServiceError(
        "Пользователь находится в глобальном ЧС стаффа.",
      );
    }

    const actorGlobal = actorAssignments.find((row) =>
      GLOBAL_ROLES.includes(row.role),
    );

    if (!actorGlobal) {
      const actorBranchRoles = actorAssignments.filter(
        (row) =>
          row.branchId === branch.id && MANAGEMENT_ROLES.includes(row.role),
      );

      if (actorBranchRoles.length === 0) {
        throw new TeamServiceError(
          "Недостаточно прав для управления этой веткой.",
        );
      }

      const actorWeight = Math.max(
        ...actorBranchRoles.map((row) => ROLE_WEIGHT[row.role]),
      );
      const targetBranchWeight = Math.max(
        0,
        ...targetAssignments
          .filter((row) => row.branchId === branch.id)
          .map((row) => ROLE_WEIGHT[row.role]),
      );

      if (
        actorWeight <= ROLE_WEIGHT[input.role] ||
        actorWeight <= targetBranchWeight
      ) {
        throw new TeamServiceError(
          "Нельзя назначить роль равную или выше вашей позиции.",
        );
      }
    }

    const [personalRow] = await db
      .select()
      .from(personal)
      .where(eq(personal.userId, input.targetUserId))
      .limit(1);

    if (!personalRow) {
      await db.insert(personal).values({
        userId: input.targetUserId,
        displayName: input.targetDisplayName,
        createdAt: now(),
        updatedAt: now(),
      });
    }

    const existingInBranch = targetAssignments.find(
      (row) => row.branchId === branch.id,
    );
    if (existingInBranch) {
      await db
        .update(staffAssignments)
        .set({ active: false, updatedAt: now(), closedAt: now() })
        .where(eq(staffAssignments.id, existingInBranch.id));
    }

    const [createdAssignment] = await db
      .insert(staffAssignments)
      .values({
        userId: input.targetUserId,
        branchId: branch.id,
        role: input.role,
        assignedByUserId: input.actorUserId,
        reason: input.reason,
        active: true,
        createdAt: now(),
        updatedAt: now(),
      })
      .returning();

    if (!createdAssignment) {
      throw new TeamServiceError("Не удалось создать назначение.");
    }

    return { branch, assignment: createdAssignment };
  },

  async removeBranchRole(input: {
    actorUserId: string;
    targetUserId: string;
    branchCode: StaffBranchCode;
    reason?: string;
  }) {
    const [branch] = await db
      .select()
      .from(staffBranches)
      .where(
        and(
          eq(staffBranches.code, input.branchCode),
          eq(staffBranches.isActive, true),
        ),
      )
      .limit(1);

    if (!branch) {
      throw new TeamServiceError("Ветка не найдена или отключена.");
    }

    const actorAssignments = await this.getActiveAssignments(input.actorUserId);
    const targetAssignments = await this.getActiveAssignments(
      input.targetUserId,
    );

    const targetAssignment = targetAssignments.find(
      (row) => row.branchId === branch.id,
    );
    if (!targetAssignment) {
      throw new TeamServiceError(
        "У пользователя нет активной роли в этой ветке.",
      );
    }

    const actorGlobal = actorAssignments.find((row) =>
      GLOBAL_ROLES.includes(row.role),
    );

    if (!actorGlobal) {
      const actorBranchRoles = actorAssignments.filter(
        (row) => row.branchId === branch.id,
      );
      if (!actorBranchRoles.length) {
        throw new TeamServiceError(
          "Недостаточно прав для снятия роли в этой ветке.",
        );
      }

      const actorWeight = Math.max(
        ...actorBranchRoles.map((row) => ROLE_WEIGHT[row.role]),
      );
      if (actorWeight <= ROLE_WEIGHT[targetAssignment.role]) {
        throw new TeamServiceError(
          "Нельзя снять роль у равной/старшей позиции.",
        );
      }
    }

    await db
      .update(staffAssignments)
      .set({
        active: false,
        updatedAt: now(),
        closedAt: now(),
        reason: input.reason ?? targetAssignment.reason,
      })
      .where(eq(staffAssignments.id, targetAssignment.id));

    return { branch, assignment: targetAssignment };
  },

  async addGlobalBlacklist(input: {
    actorUserId: string;
    targetUserId: string;
    reason: string;
    targetDisplayName?: string;
  }) {
    const actorAssignments = await this.getActiveAssignments(input.actorUserId);
    const actorGlobal = actorAssignments.find((row) =>
      GLOBAL_ROLES.includes(row.role),
    );

    if (!actorGlobal) {
      throw new TeamServiceError(
        "Глобальным ЧС может управлять только owner/dev/staff-admin.",
      );
    }

    const [personalRow] = await db
      .select()
      .from(personal)
      .where(eq(personal.userId, input.targetUserId))
      .limit(1);

    if (!personalRow) {
      await db.insert(personal).values({
        userId: input.targetUserId,
        displayName: input.targetDisplayName,
        createdAt: now(),
        updatedAt: now(),
      });
    }

    await db
      .update(staffGlobalBlacklists)
      .set({ active: false, revokedAt: now() })
      .where(
        and(
          eq(staffGlobalBlacklists.userId, input.targetUserId),
          eq(staffGlobalBlacklists.active, true),
        ),
      );

    const [blacklist] = await db
      .insert(staffGlobalBlacklists)
      .values({
        userId: input.targetUserId,
        reason: input.reason,
        issuedByUserId: input.actorUserId,
        active: true,
        createdAt: now(),
      })
      .returning();

    await db
      .update(personal)
      .set({
        isGlobalBlacklisted: true,
        globalBlacklistReason: input.reason,
        updatedAt: now(),
      })
      .where(eq(personal.userId, input.targetUserId));

    await db
      .update(staffAssignments)
      .set({ active: false, closedAt: now(), updatedAt: now() })
      .where(
        and(
          eq(staffAssignments.userId, input.targetUserId),
          eq(staffAssignments.active, true),
        ),
      );

    if (!blacklist) {
      throw new TeamServiceError("Не удалось выдать глобальный ЧС.");
    }

    return blacklist;
  },

  async removeGlobalBlacklist(input: {
    actorUserId: string;
    targetUserId: string;
    reason?: string;
  }) {
    const actorAssignments = await this.getActiveAssignments(input.actorUserId);
    const actorGlobal = actorAssignments.find((row) =>
      GLOBAL_ROLES.includes(row.role),
    );

    if (!actorGlobal) {
      throw new TeamServiceError(
        "Глобальным ЧС может управлять только owner/dev/staff-admin.",
      );
    }

    const [activeBlacklist] = await db
      .select()
      .from(staffGlobalBlacklists)
      .where(
        and(
          eq(staffGlobalBlacklists.userId, input.targetUserId),
          eq(staffGlobalBlacklists.active, true),
        ),
      )
      .limit(1);

    if (!activeBlacklist) {
      throw new TeamServiceError(
        "У пользователя нет активного глобального ЧС.",
      );
    }

    await db
      .update(staffGlobalBlacklists)
      .set({
        active: false,
        revokedAt: now(),
        reason: input.reason ?? activeBlacklist.reason,
      })
      .where(eq(staffGlobalBlacklists.id, activeBlacklist.id));

    await db
      .update(personal)
      .set({
        isGlobalBlacklisted: false,
        globalBlacklistReason: null,
        updatedAt: now(),
      })
      .where(eq(personal.userId, input.targetUserId));

    return activeBlacklist;
  },

  async getActiveBranchMembers(branchCode: StaffBranchCode) {
    const [branch] = await db
      .select()
      .from(staffBranches)
      .where(
        and(
          eq(staffBranches.code, branchCode),
          eq(staffBranches.isActive, true),
        ),
      )
      .limit(1);

    if (!branch) {
      throw new TeamServiceError("Ветка не найдена или отключена.");
    }

    const rows = await db
      .select()
      .from(staffAssignments)
      .where(
        and(
          eq(staffAssignments.branchId, branch.id),
          eq(staffAssignments.active, true),
        ),
      )
      .orderBy(desc(staffAssignments.createdAt));

    return { branch, rows };
  },
};
