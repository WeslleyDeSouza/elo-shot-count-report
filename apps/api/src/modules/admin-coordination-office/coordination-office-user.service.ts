import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoordinationOfficeUserEntity } from './entities/coordination-office-user.entity';
import { AuthUserEntity, AuthAdminService, IAuthUser } from '@movit/auth-api';

export interface UserAssignment {
  userId: string;
  coordinationOfficeId: string;
  assignedAt: Date;
  assignedBy: string;
  role: string;
}

@Injectable()
export class CoordinationOfficeUserService {
  constructor(
    @InjectRepository(CoordinationOfficeUserEntity)
    private coordinationOfficeUserRepo: Repository<CoordinationOfficeUserEntity>,
    @InjectRepository(AuthUserEntity)
    private userRepo: Repository<AuthUserEntity>,
    private authUserService: AuthAdminService
  ) {}

  /**
   * Gets all available users in the system.
   * @param tenantId - Tenant ID for multi-tenancy
   * @returns Promise of users array
   */
  async getAllUsers(tenantId: string): Promise<Partial<IAuthUser>[]> {
    try {
      const users = await this.userRepo.find({
        where: <any>{ tenantId },
        select: ['userId', 'firstName', 'lastName', 'email', 'avatar', 'gender']
      });

      return users.map(user => ({
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        gender: user.gender
      }));
    } catch (error) {
      // Fallback to AuthUserService if direct repo access fails
      try {
        const users = await this.authUserService.getUsers(<any>tenantId);
        return users.map(user => ({
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          gender: user.gender
        }));
      } catch (fallbackError) {
        console.error('Failed to load users:', error, fallbackError);
        return [];
      }
    }
  }

  /**
   * Gets users assigned to a coordination office by PIN.
   * @param tenantId - Tenant ID for multi-tenancy
   * @param pin - Coordination office PIN
   * @returns Promise of assigned users array
   */
  async getUsersByPin(tenantId: string, pin: string): Promise<Partial<IAuthUser>[]> {
    const assignments = await this.coordinationOfficeUserRepo
      .createQueryBuilder('assignment')
      .innerJoin('assignment.coordinationOffice', 'office')
      .innerJoin('assignment.user', 'user', 'user.userId = assignment.userId')
      .select([
        'user.userId',
      ])

      .where('assignment.tenantId = :tenantId', { tenantId })
      .andWhere('office.pin = :pin', { pin })
      .getRawMany();

      const removePrefix = (prefix)=> ( obj) => {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
          if (key.startsWith(prefix)) {
            return [key.slice(prefix.length), value];
          }
          return [key, value];
        })
      );
    }

      return assignments.map(removePrefix('user_'));
  }

  /**
   * Assigns a user to a coordination office.
   * @param tenantId - Tenant ID for multi-tenancy
   * @param userId - User ID to assign
   * @param coordinationOfficeId - Coordination office ID
   * @param assignedBy - ID of user making the assignment
   * @returns Promise boolean indicating success
   */
  async assignUser(tenantId: string, userId: string, coordinationOfficeId: string, assignedBy?: string): Promise<boolean> {
    try {
      // Check if assignment already exists
      const existingAssignment = await this.coordinationOfficeUserRepo.findOne({
        where: {
          tenantId,
          userId,
          coordinationOfficeId
        }
      });

      if (existingAssignment) {
        return true; // Already assigned
      }

      // Verify user exists
      const user = await this.userRepo.findOne({
        where: {  userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create assignment
      const assignment = this.coordinationOfficeUserRepo.create({
        tenantId,
        userId,
        coordinationOfficeId,
        assignedBy,
        role: 'member'
      });

      await assignment.save();
      return true;
    } catch (error) {
      console.error('Error assigning user:', error);
      return false;
    }
  }

  /**
   * Unassigns a user from a coordination office.
   * @param tenantId - Tenant ID for multi-tenancy
   * @param userId - User ID to unassign
   * @param coordinationOfficeId - Coordination office ID
   * @returns Promise boolean indicating success
   */
  async unassignUser(tenantId: string, userId: string, coordinationOfficeId: string): Promise<boolean> {
    try {
      const result = await this.coordinationOfficeUserRepo.delete({
        tenantId,
        userId,
        coordinationOfficeId
      });

      return result.affected > 0;
    } catch (error) {
      console.error('Error unassigning user:', error);
      return false;
    }
  }

  /**
   * Gets all assignments for a coordination office.
   * @param tenantId - Tenant ID for multi-tenancy
   * @param coordinationOfficeId - Coordination office ID
   * @returns Promise of user assignments array
   */
  async getAssignmentsByOffice(tenantId: string, coordinationOfficeId: string): Promise<UserAssignment[]> {
    const assignments = await this.coordinationOfficeUserRepo.find({
      where: {
        tenantId,
        coordinationOfficeId
      },
      relations: ['user', 'coordinationOffice']
    });

    return assignments.map(assignment => ({
      userId: assignment.userId,
      coordinationOfficeId: assignment.coordinationOfficeId,
      assignedAt: assignment.assignedAt,
      assignedBy: assignment.assignedBy,
      role: assignment.role
    }));
  }

  /**
   * Gets all assignments for a user.
   * @param tenantId - Tenant ID for multi-tenancy
   * @param userId - User ID
   * @returns Promise of user assignments array
   */
  async getAssignmentsByUser(tenantId: string, userId: string): Promise<UserAssignment[]> {
    const assignments = await this.coordinationOfficeUserRepo.find({
      where: {
        tenantId,
        userId
      },
      relations: ['user', 'coordinationOffice']
    });

    return assignments.map(assignment => ({
      userId: assignment.userId,
      coordinationOfficeId: assignment.coordinationOfficeId,
      assignedAt: assignment.assignedAt,
      assignedBy: assignment.assignedBy,
      role: assignment.role
    }));
  }

  /**
   * Validates if a user can be assigned to a coordination office.
   * @param tenantId - Tenant ID for multi-tenancy
   * @param userId - User ID to validate
   * @param coordinationOfficeId - Coordination office ID
   * @returns Promise boolean indicating if assignment is valid
   */
  async validateUserAssignment(tenantId: string, userId: string, coordinationOfficeId: string): Promise<boolean> {
    try {
      // Check if user exists
      const user = await this.userRepo.findOne({
        where: <any>{ tenantId, userId }
      });

      if (!user) {
        return false;
      }

      // Check if assignment already exists
      const existingAssignment = await this.coordinationOfficeUserRepo.findOne({
        where: {
          tenantId,
          userId,
          coordinationOfficeId
        }
      });

      // Return false if already assigned, true if can be assigned
      return !existingAssignment;
    } catch (error) {
      console.error('Error validating user assignment:', error);
      return false;
    }
  }
}
