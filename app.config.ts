import type { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }) => ({
  ...config,
  extra: {
    ...config.extra,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    passwordResetRedirectUrl: process.env.EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_URL,
  },
});
