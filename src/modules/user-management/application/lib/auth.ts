import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GoogleProvider],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
