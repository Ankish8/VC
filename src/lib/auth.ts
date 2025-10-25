import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const authConfig: NextAuthConfig = {
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[Auth] Missing credentials");
            return null;
          }

          // Find user in database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          });

          if (!user) {
            console.error("[Auth] User not found:", credentials.email);
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.error("[Auth] Invalid password for:", credentials.email);
            return null;
          }

          console.log("[Auth] Login successful for:", credentials.email);

          // Return user object (without password)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            mustChangePassword: user.mustChangePassword,
            isAdmin: user.isAdmin,
          };
        } catch (error) {
          console.error("[Auth] Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Add user data to token on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name ?? undefined;
        token.mustChangePassword = (user as any).mustChangePassword ?? false;
        token.isAdmin = (user as any).isAdmin ?? false;
      }

      // Refresh mustChangePassword flag from database on update
      if (trigger === "update" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { mustChangePassword: true, isAdmin: true },
        });
        if (dbUser) {
          token.mustChangePassword = dbUser.mustChangePassword;
          token.isAdmin = dbUser.isAdmin;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Add user data to session from token
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name;
        (session.user as any).mustChangePassword = token.mustChangePassword ?? false;
        (session.user as any).isAdmin = token.isAdmin ?? false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  basePath: "/api/auth",
};

export const authOptions = authConfig;
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
