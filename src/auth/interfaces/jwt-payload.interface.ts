export interface JwtPayload {
  sub: number;
  telegramId: string;
  iat?: number;
  exp?: number;
}
