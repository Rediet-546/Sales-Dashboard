import { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';
import { ActivityModel } from '../models/ActivityModel';

export class RoleController {
  static async assignManager(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { managerId } = req.body;

      if (!managerId) {
        return res.status(400).json({ error: 'Manager ID is required' });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const manager = await UserModel.findById(managerId);
      if (!manager) {
        return res.status(404).json({ error: 'Manager not found' });
      }

      const updated = await UserModel.updateUser(userId, { managerId });

      await ActivityModel.logActivity(
        (req as any).user?.id,
        'assign',
        `Assigned ${manager.name} as manager for ${user.name}`,
        'role'
      );

      res.json({
        success: true,
        message: `Manager assigned to ${user.name}`,
        user: updated,
      });
    } catch (error) {
      console.error('Assign manager error:', error);
      res.status(500).json({ error: 'Failed to assign manager' });
    }
  }

  static async changeUserRole(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const validRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'VIEWER'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const user = await UserModel.updateUser(userId, { role });

      await ActivityModel.logActivity(
        (req as any).user?.id,
        'role_change',
        `Changed ${user.name}'s role to ${role}`,
        'role'
      );

      res.json({
        success: true,
        message: `Role updated to ${role}`,
        user,
      });
    } catch (error) {
      console.error('Change role error:', error);
      res.status(500).json({ error: 'Failed to change role' });
    }
  }

  static async getTeamManagers(req: Request, res: Response) {
    try {
      const users = await UserModel.getAllUsers();
      const managers = users.filter((u: any) => u.role === 'MANAGER' || u.role === 'ADMIN');
      
      const managerData = managers.map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        team: m.team,
        subordinateCount: users.filter((u: any) => u.managerId === m.id).length,
      }));

      res.json({ managers: managerData });
    } catch (error) {
      console.error('Get managers error:', error);
      res.status(500).json({ error: 'Failed to get managers' });
    }
  }
}