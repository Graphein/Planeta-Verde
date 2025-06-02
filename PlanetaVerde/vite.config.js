export default {
  server: {
    port: 3000, // Porta do frontend
    proxy: {
      "/doacoes": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/atividades": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/login": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/recuperar-senha": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/redefinir-senha": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/trocar-senha": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/usuarios": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
};