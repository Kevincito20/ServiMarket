/**
 * Security-focused in-memory data store for authorization and payment validation.
 */
import { randomBytes } from 'node:crypto';
import type { AuthUser, OrderStatus } from './types';
import { hashPassword } from '../shared/lib/passwords';

export interface Order {
  id: string;
  providerId: string;
  clientId: string;
  status: OrderStatus;
  amount: number;
}

export interface Service {
  id: string;
  providerId: string;
  title: string;
  description: string;
}

export interface StoredUser extends AuthUser {
  passwordHash: string;
  passwordSalt: string;
}

export interface DataStore {
  users: Map<string, StoredUser>;
  orders: Map<string, Order>;
  services: Map<string, Service>;
}

export const testUsers = {
  providerA: {
    id: 'provider-a',
    role: 'provider',
    email: 'provider-a@servimarket.test',
  },
  providerB: {
    id: 'provider-b',
    role: 'provider',
    email: 'provider-b@servimarket.test',
  },
  client: {
    id: 'client-a',
    role: 'client',
    email: 'client-a@servimarket.test',
  },
} as const satisfies Record<string, AuthUser>;

const seedPasswordSalt = randomBytes(16).toString('hex');
const seedPassword = randomBytes(32).toString('hex');
const seedPasswordHash = hashPassword(seedPassword, seedPasswordSalt);

const createStoredUser = (user: AuthUser): StoredUser => ({
  ...user,
  passwordHash: seedPasswordHash,
  passwordSalt: seedPasswordSalt,
});

export const testOrders = {
  providerBOrder: {
    id: 'order-provider-b',
    providerId: testUsers.providerB.id,
    clientId: testUsers.client.id,
    status: 'pending' as OrderStatus,
    amount: 5000,
  },
};

export const testServices = {
  providerAService: {
    id: 'service-provider-a',
    providerId: testUsers.providerA.id,
    title: 'Logo Design',
    description: 'Professional logo design service.',
  },
};

export const createDataStore = (): DataStore => {
  const users = new Map<string, StoredUser>([
    [testUsers.providerA.id, createStoredUser(testUsers.providerA)],
    [testUsers.providerB.id, createStoredUser(testUsers.providerB)],
    [testUsers.client.id, createStoredUser(testUsers.client)],
  ]);

  const orders = new Map<string, Order>([
    [testOrders.providerBOrder.id, { ...testOrders.providerBOrder }],
  ]);

  const services = new Map<string, Service>([
    [testServices.providerAService.id, { ...testServices.providerAService }],
  ]);

  return { users, orders, services };
};
