import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { toUserDTO, toUserDTOList } from '../dto/user.dto.js';
import { toLateFeePolicyDTO, ROUNDING_TO_DB } from '../dto/config.dto.js';

const POLICY_SINGLETON_ID = 1;

export const adminService = {
  async listUsers() {
    const users = await prisma.user.findMany({
      include: { branch: true },
      orderBy: { createdAt: 'desc' },
    });
    return toUserDTOList(users);
  },

  async updateUserRole(actingAdminId, targetUserId, role) {
    if (actingAdminId === targetUserId) {
      throw AppError.badRequest('You cannot change your own role.');
    }

    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) throw AppError.notFound('User not found.');

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: role.toUpperCase() },
      include: { branch: true },
    });

    return toUserDTO(updated);
  },

  async updateUserStatus(actingAdminId, targetUserId, status) {
    if (actingAdminId === targetUserId) {
      throw AppError.badRequest('You cannot change your own account status.');
    }

    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) throw AppError.notFound('User not found.');

    const nextStatus = status.toUpperCase();

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: nextStatus,
        // Suspending a user immediately invalidates any JWT they're
        // currently holding (see tokenVersion check in protect middleware) —
        // otherwise a suspended user could keep using the app until their
        // token naturally expired.
        ...(nextStatus === 'SUSPENDED' ? { tokenVersion: { increment: 1 } } : {}),
      },
      include: { branch: true },
    });

    return toUserDTO(updated);
  },

  async deleteUser(actingAdminId, targetUserId) {
    if (actingAdminId === targetUserId) {
      throw AppError.badRequest('You cannot delete your own account.');
    }

    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) throw AppError.notFound('User not found.');

    // Rentals cascade-delete with the user (see schema.prisma onDelete: Cascade).
    await prisma.user.delete({ where: { id: targetUserId } });
  },

  async getLateFeePolicy() {
    const policy = await prisma.lateFeePolicy.upsert({
      where: { id: POLICY_SINGLETON_ID },
      update: {},
      create: { id: POLICY_SINGLETON_ID },
    });
    return toLateFeePolicyDTO(policy);
  },

  async saveLateFeePolicy(payload) {
    const data = {
      gracePeriodMinutes: payload.gracePeriodMinutes,
      hourlyRate: payload.hourlyRate,
      dailyMaxLimit: payload.dailyMaxLimit,
      roundingLogic: ROUNDING_TO_DB[payload.roundingLogic],
      autoLockAtAmount: payload.autoLockAtAmount,
      autoLockEnabled: payload.autoLockEnabled,
      legalAutoDraftEnabled: payload.legalAutoDraftEnabled,
    };

    const policy = await prisma.lateFeePolicy.upsert({
      where: { id: POLICY_SINGLETON_ID },
      update: data,
      create: { id: POLICY_SINGLETON_ID, ...data },
    });

    return toLateFeePolicyDTO(policy);
  },
};

export default adminService;
