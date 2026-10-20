import { registerSchema, loginSchema } from './auth';

describe('auth schemas', () => {
  describe('registerSchema', () => {
    it('accepts valid registration data', () => {
      const valid = {
        name: 'Jane Student',
        email: 'jane@university.edu',
        password: 'password123',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('jane@university.edu');
      }
    });

    it('rejects short name or whitespace only', () => {
      const invalid = {
        name: ' a ',
        email: 'jane@university.edu',
        password: 'password123',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid email formats', () => {
      const invalid = {
        name: 'Jane Student',
        email: 'invalid-email',
        password: 'password123',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const invalid = {
        name: 'Jane Student',
        email: 'jane@university.edu',
        password: 'short',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login data', () => {
      const valid = {
        email: 'jane@university.edu',
        password: 'securePassword',
      };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects empty password', () => {
      const invalid = {
        email: 'jane@university.edu',
        password: '',
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects malformed email', () => {
      const invalid = {
        email: 'not-an-email',
        password: 'password',
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
