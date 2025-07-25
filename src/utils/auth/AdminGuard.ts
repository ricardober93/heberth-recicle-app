import { neon } from '@neondatabase/serverless';
import { User } from './types';

export class AdminGuard {
  private sql = neon(process.env.DATABASE_URL!);

  async isAdmin(user: User): Promise<boolean> {
    // If user already has admin role in session, return true
    if (user.role === 'admin') {
      return true;
    }

    // Otherwise, check database directly
    return await this.checkRoleInDB(user.id);
  }

  private async checkRoleInDB(userId: string): Promise<boolean> {
    try {
      const userResult = await this.sql`
        SELECT role FROM "user" WHERE id = ${userId}
      `;
      
      return userResult.length > 0 && userResult[0].role === 'admin';
    } catch (error) {
      return false;
    }
  }
}