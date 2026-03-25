/**
 * Security-focused in-memory data store for authorization and payment validation.
 */
import type { AuthUser, OrderStatus } from './types';

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

export interface DataStore {
  users: Map<string, AuthUser>;
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
  const users = new Map<string, AuthUser>([
    [testUsers.providerA.id, testUsers.providerA],
    [testUsers.providerB.id, testUsers.providerB],
    [testUsers.client.id, testUsers.client],
  ]);

  const orders = new Map<string, Order>([
    [testOrders.providerBOrder.id, { ...testOrders.providerBOrder }],
  ]);

  const services = new Map<string, Service>([
    [testServices.providerAService.id, { ...testServices.providerAService }],
  ]);

  return { users, orders, services };
};
