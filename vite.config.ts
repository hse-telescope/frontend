import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import eslint from 'vite-plugin-eslint';
// import stylelint from 'vite-plugin-stylelint';

// export default defineConfig(({ mode }) => {
//     let urlAPI = 'http://localhost:8080';
//     if (mode === 'development') {
//         urlAPI = 'http://localhost:8080';
//     }

//     return {
//         plugins: [
//             react(),
//             // eslint(),
//             // stylelint({
//             //     fix: true,
//             // }),
//         ],
//         server: {
//             host: 'localhost',
//             port: 3000,
//             proxy: {
//                 '/core/api/core/': {
//                     target: urlAPI,
//                     changeOrigin: true,
//                     secure: false,
//                 },
//             },
export default defineConfig({
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/api\/core/, '')
        },
        // '/auth': {
        //   target: 'http://localhost:8081',
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/auth/, '')
        // }
      }
    }
  })
