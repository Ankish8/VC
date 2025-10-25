import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Return user object (without password)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          mustChangePassword: user.mustChangePassword,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
};

export const authOptions = authConfig;
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
