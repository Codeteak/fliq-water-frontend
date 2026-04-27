export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  role: "customer";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSession extends AuthTokens {
  user: AuthUser;
}

export interface RegisterOtpSentResponse {
  sent: boolean;
  message: string;
}
