export class JwtStrategy {async validate(payload: any) {
  console.log('[JWT VALIDATE]', payload);
  return payload;
}
}
