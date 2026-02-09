import app from './app';
import { config } from './config';

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🙏 Swadhrama Parirakshna API Server                     ║
  ║                                                           ║
  ║   Environment: ${config.env.padEnd(43)}║
  ║   Port: ${String(PORT).padEnd(50)}║
  ║   API Version: ${config.apiVersion.padEnd(43)}║
  ║                                                           ║
  ║   Endpoints:                                              ║
  ║   - Health:     http://localhost:${PORT}/health             ║
  ║   - Auth:       http://localhost:${PORT}/api/v1/auth        ║
  ║   - Users:      http://localhost:${PORT}/api/v1/users       ║
  ║   - Households: http://localhost:${PORT}/api/v1/households  ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});
