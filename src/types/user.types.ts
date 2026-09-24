export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  age?: number;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  age?: number;
  profileImage?: string;
}