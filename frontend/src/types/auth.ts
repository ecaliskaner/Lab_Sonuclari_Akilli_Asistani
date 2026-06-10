export interface User {
  id: number;
  fullName: string;
  role: 'DOCTOR' | 'ADMIN';
  email?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    fullName: string;
    role: 'DOCTOR' | 'ADMIN';
  };
}
