export const JWT_REFRESH_TOKEN_SECRET = Symbol('refresh token secret');
export const JWT_REFRESH_TOKEN_EXPIRATION_TIME = Symbol(
  'refresh token expiration time',
);

export const JWT_ACCESS_TOKEN_SECRET = Symbol('access token secret');
export const JWT_ACCESS_TOKEN_EXPIRATION_TIME = Symbol(
  'access token expiration time',
);

export function describeJWT(key: symbol): string {
  switch (key) {
    case JWT_REFRESH_TOKEN_SECRET:
      return 'JWT_REFRESH_TOKEN_SECRET';
    case JWT_REFRESH_TOKEN_EXPIRATION_TIME:
      return 'JWT_REFRESH_TOKEN_EXPIRATION_TIME';
    case JWT_ACCESS_TOKEN_SECRET:
      return 'JWT_ACCESS_TOKEN_SECRET';
    case JWT_ACCESS_TOKEN_EXPIRATION_TIME:
      return 'JWT_ACCESS_TOKEN_EXPIRATION_TIME';
    default:
      return 'ERROR';
  }
}
