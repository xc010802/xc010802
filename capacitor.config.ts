import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myblog.app',
  appName: '我的博客',
  webDir: '.output/public',
  server: {
    // ✅ 指向你的 Vercel 线上地址（重要！）
    url: 'https://my-blog-one-gray.vercel.app',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;