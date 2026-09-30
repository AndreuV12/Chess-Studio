export type LoginFields = {
  email: string;
  password: string;
};

export type RegisterFields = LoginFields & {
  name: string;
  passwordConfirmation: string;
};

export type RegistrationResponse = {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export type ApiErrorResponse = {
  error: string;
};
