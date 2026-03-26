/**
 * Security-focused domain types for authenticated access control.
 */
export type UserRole = 'provider' | 'client';

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'completed';
