import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';

const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'https://lushsecret.onrender.com/api';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: {
        appleId: process.env.APPLE_ID,
        teamId: process.env.APPLE_TEAM_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        keyId: process.env.APPLE_KEY_ID,
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const provider = account.provider;
        const oauthId = profile.sub || profile.id;
        const email = profile.email || null;
        const name = profile.name || profile.given_name || profile.username || 'Usuario';

        const response = await fetch(`${backendUrl}/auth/oauth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, oauthId, email, name }),
        });

        const data = await response.json();
        if (response.ok) {
          token.backendToken = data.token;
          token.user = data.user;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.backendToken) {
        session.backendToken = token.backendToken;
      }
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
