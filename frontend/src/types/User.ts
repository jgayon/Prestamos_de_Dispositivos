export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
}
