export class UserEntity {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;
  public readonly role: string;
  public readonly department?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(data: UserEntityData) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.department = data.department;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public static create(data: CreateUserData): UserEntity {
    const now = new Date();
    const id = crypto.randomUUID();
    
    UserEntity.validateEmail(data.email);
    UserEntity.validateName(data.name);
    
    return new UserEntity({
      id,
      name: data.name,
      email: data.email,
      role: data.role || 'user',
      department: data.department,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static fromExisting(data: UserEntityData): UserEntity {
    return new UserEntity(data);
  }

  public update(data: Partial<UpdateUserData>): UserEntity {
    return new UserEntity({
      ...this.toJSON(),
      name: data.name || this.name,
      email: data.email || this.email,
      role: data.role || this.role,
      department: data.department !== undefined ? data.department : this.department,
      updatedAt: new Date(),
    });
  }

  public toJSON(): UserEntityData {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      department: this.department,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
  }
}

export interface UserEntityData {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  role?: string;
  department?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  department?: string;
}