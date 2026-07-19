import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { toUserDTO } from '../dto/user.dto.js';

export const userService = {
  /** Updates the caller's own name/email. Authorization (self vs admin) is enforced in the controller. */
  async updateProfile(userId, patch) {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw AppError.notFound('User not found.');

    if (patch.email && patch.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: patch.email } });
      if (emailTaken) throw AppError.conflict('An account with this email already exists.');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: patch,
      include: { branch: true },
    });

    return toUserDTO(updated);
  },
};

export default userService;
