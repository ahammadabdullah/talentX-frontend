import "next-auth";
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      email: string;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    role: UserRole;
    email: string;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    accessToken: string;
  }
}
