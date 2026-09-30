const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegistrationData = LoginCredentials & {
  name: string;
  passwordConfirmation: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, expectedKeys: string[]): boolean {
  const receivedKeys = Object.keys(value);
  return receivedKeys.length === expectedKeys.length && expectedKeys.every((key) => receivedKeys.includes(key));
}

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 255 && emailPattern.test(value);
}

function isValidPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 8 && value.length <= 72;
}

export class AuthValidationService {
  static validateCredentials(credentials: unknown): LoginCredentials | null {
    if (!isRecord(credentials)) return null;

    const email = credentials.email;
    const password = credentials.password;

    if (!isValidEmail(email) || typeof password !== "string" || password.length < 1 || password.length > 72) {
      return null;
    }

    return { email, password };
  }

  static validateRegistration(data: unknown): RegistrationData | null {
    if (!isRecord(data) || !hasOnlyKeys(data, ["name", "email", "password", "passwordConfirmation"])) {
      return null;
    }

    const name = data.name;
    const email = data.email;
    const password = data.password;
    const passwordConfirmation = data.passwordConfirmation;

    if (
      typeof name !== "string" ||
      name.length < 2 ||
      name.length > 255 ||
      !isValidEmail(email) ||
      !isValidPassword(password) ||
      passwordConfirmation !== password
    ) {
      return null;
    }

    return { name, email, password, passwordConfirmation };
  }

  static getSafeCallbackUrl(callbackUrl: string | string[] | undefined): string {
    if (typeof callbackUrl !== "string" || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
      return "/";
    }

    return callbackUrl;
  }
}
