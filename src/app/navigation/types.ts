export type AuthStackParams = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParams = {
  Home: undefined;
  Orders: undefined;
  Profile: undefined;
  MyServices: undefined;
  ServiceDetail: { serviceId: string };
  CreateService: undefined;
  EditService: { serviceId: string };
  CreateOrder: { serviceId: string };
  OrderDetail: { orderId: string };
  Chat: { orderId: string };
  CreateReview: { orderId: string };
};

export type RootStackParams = {
  Auth: undefined;
  App: undefined;
};

