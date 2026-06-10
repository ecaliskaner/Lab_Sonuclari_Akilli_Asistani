import { axiosInstance } from './axiosInstance';
import type { TokenResponse } from '../types/auth';
import { encryptPassword } from './cryptoHelper';

export const authApi = {
  getPublicKey: async (): Promise<string> => {
    const response = await axiosInstance.get<{ publicKey: string }>('/api/auth/public-key');
    return response.data.publicKey;
  },

  login: async (email: string, plainPassword: string): Promise<TokenResponse> => {
    // 1. Fetch the ephemeral/persisted RSA public key
    const publicKeyPem = await authApi.getPublicKey();

    // 2. Encrypt the password locally
    const encryptedPassword = await encryptPassword(plainPassword, publicKeyPem);

    // 3. Post the credentials to the login endpoint
    const response = await axiosInstance.post<TokenResponse>('/api/auth/login', {
      email,
      password: encryptedPassword,
    });
    return response.data;
  },
};
