export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
