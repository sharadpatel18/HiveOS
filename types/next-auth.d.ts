import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    fullName?: string; // ✅ ADD THIS
  }

  interface Session {
    user: {
      id: string;
      email: string;
      fullName?: string;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    fullName?: string; // ✅ ADD THIS
  }
}
