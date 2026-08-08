import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ActivityModel } from '../models/ActivityModel';

export class ApprovalController {
  static async createRequest(req: Request, res: Response) {
    try {
      const managerId = (req as any).user?.id;
      const { type, requestData, reason, adminId } = req.body;

      if (!adminId) {
        return res.status(400).json({ error: 'Admin ID is required' });
      }

      const approval = await prisma.approvalRequest.create({
        data: {
          type,
          requestData,
          reason,
          managerId,
          adminId,
        },
      });

      await ActivityModel.logActivity(
        managerId,
        'create',
        `Created approval request: ${type}`,
        'approval',
        { approvalId: approval.id }
      );

      res.status(201).json({ success: true, approval });
    } catch (error) {
      console.error('Create approval error:', error);
      res.status(500).json({ error: 'Failed to create approval request' });
    }
  }

  static async getAllRequests(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, shopId: true },
      });

      let where: any = {};
      
      if (user?.role === 'ADMIN') {
        where = { adminId: userId };
      } else if (user?.role === 'MANAGER') {
        where = { managerId: userId };
      } else {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const requests = await prisma.approvalRequest.findMany({
        where,
        include: {
          manager: { select: { id: true, name: true, email: true } },
          admin: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ requests });
    } catch (error) {
      console.error('Get approvals error:', error);
      res.status(500).json({ error: 'Failed to get approvals' });
    }
  }

  static async approve(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminId = (req as any).user?.id;

      const approval = await prisma.approvalRequest.findUnique({
        where: { id },
        include: { manager: true },
      });

      if (!approval) {
        return res.status(404).json({ error: 'Approval request not found' });
      }

      if (approval.adminId !== adminId) {
        return res.status(403).json({ error: 'You are not authorized to approve this request' });
      }

      const updated = await prisma.approvalRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          resolvedAt: new Date(),
        },
      });

      await ActivityModel.logActivity(
        adminId,
        'approve',
        `Approved request: ${approval.type} from ${approval.manager.name}`,
        'approval',
        { approvalId: approval.id }
      );

      res.json({ success: true, approval: updated });
    } catch (error) {
      console.error('Approve error:', error);
      res.status(500).json({ error: 'Failed to approve request' });
    }
  }

  static async reject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminId = (req as any).user?.id;

      const approval = await prisma.approvalRequest.findUnique({
        where: { id },
        include: { manager: true },
      });

      if (!approval) {
        return res.status(404).json({ error: 'Approval request not found' });
      }

      if (approval.adminId !== adminId) {
        return res.status(403).json({ error: 'You are not authorized to reject this request' });
      }

      const updated = await prisma.approvalRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          resolvedAt: new Date(),
        },
      });

      await ActivityModel.logActivity(
        adminId,
        'reject',
        `Rejected request: ${approval.type} from ${approval.manager.name}`,
        'approval',
        { approvalId: approval.id }
      );

      res.json({ success: true, approval: updated });
    } catch (error) {
      console.error('Reject error:', error);
      res.status(500).json({ error: 'Failed to reject request' });
    }
  }
}