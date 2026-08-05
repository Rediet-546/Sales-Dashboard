import { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';
import { ActivityModel } from '../models/ActivityModel';
import { SalesRecordModel } from '../models/SalesRecordModel';

export class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const updates = req.body;
      
      // Don't allow role or password updates here
      delete updates.role;
      delete updates.password;

      const user = await UserModel.updateUser(userId, updates);
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  static async getTeamMembers(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get users in the same team
      const team = await UserModel.findByTeam(user.team || '');
      res.json({ team });
    } catch (error) {
      console.error('Get team error:', error);
      res.status(500).json({ error: 'Failed to get team members' });
    }
  }

  static async getSalesRecords(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const records = await SalesRecordModel.findByUser(userId);
      res.json({ sales: records });
    } catch (error) {
      console.error('Get sales error:', error);
      res.status(500).json({ error: 'Failed to get sales records' });
    }
  }

  static async getActivities(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { limit } = req.query;
      const activities = await ActivityModel.findByUser(
        userId,
        limit ? parseInt(limit as string) : 20
      );
      res.json({ activities });
    } catch (error) {
      console.error('Get activities error:', error);
      res.status(500).json({ error: 'Failed to get activities' });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.getAllUsers();
      const sanitized = users.map(({ password, ...u }) => u);
      res.json({ users: sanitized });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  }

  static async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const user = await UserModel.updateUser(id, { role });
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
}