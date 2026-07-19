import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/tokens.js';
import { toUserDTO } from '../dto/user.dto.js';

const SALT_ROUNDS = 12;
const DEFAULT_BRANCH_ID = 'main-branch';

export const authService = {
  /**
   * Users can register as USER or VENDOR. VENDOR accounts are set to PENDING.
   * Admin accounts can never be created through this endpoint.
   */
  async register({ name, email, password, role = 'USER' }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw AppError.conflict('An account with this email already exists.');
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const assignedRole = role === 'VENDOR' ? 'VENDOR' : 'USER';
    const initialStatus = assignedRole === 'VENDOR' ? 'PENDING' : 'ACTIVE';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: assignedRole,
        status: initialStatus,
        branchId: DEFAULT_BRANCH_ID,
      },
      include: { branch: true },
    });

    const token = signToken(user);
    return { user: toUserDTO(user), token };
  },

  /**
   * Looks a user up by email OR id (the frontend labels this field
   * "Email or employee ID"), then requires the selected branch to match
   * the account's home branch. Every failure path returns the same
   * generic message + status so a caller can't use response differences
   * to enumerate valid emails, ids, or branches.
   */
  async login({ branch, identifier, password }) {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { id: identifier }] },
      include: { branch: true },
    });

    const invalidCredentials = () => AppError.unauthorized('Invalid credentials.');

    if (!user) throw invalidCredentials();
    if (user.branchId !== branch) throw invalidCredentials();

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) throw invalidCredentials();

    if (user.status === 'SUSPENDED') {
      throw AppError.forbidden('This account has been suspended. Contact IT support.');
    }
    // We allow PENDING logins so the frontend can show the "Awaiting Approval" dashboard

    const token = signToken(user);
    return { user: toUserDTO(user), token };
  },
};

export default authService;
