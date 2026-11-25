import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { client, initDb } from './db';

let dbInitialized = false;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (!dbInitialized) { await initDb(); dbInitialized = true; }
        const result = await client.execute({
          sql: 'SELECT * FROM users WHERE email = ?',
          args: [credentials.email],
        });
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        const user = {
          id: row[0] as number,
          email: row[1] as string,
          password: row[2] as string,
          name: row[3] as string,
          role: row[4] as string,
        };
        const passwordMatch = bcrypt.compareSync(credentials.password, user.password);
        if (!passwordMatch) return null;
        return { id: String(user.id), email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = (user as any).role; token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};
