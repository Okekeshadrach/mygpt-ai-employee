import http from 'http';
import { config } from './config';
import { createApp } from './app';
import { initRealtime } from './realtime/socket';
import { getStore } from './data';

async function main() {
  const app = createApp();
  const server = http.createServer(app);
  await initRealtime(server);

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n  Port ${config.port} is already in use. Usually the Docker backend (mygpt-backend) is running.`);
      console.error('  Either use it and run only the UI:   pnpm dev:frontend');
      console.error('  or stop it first:                    docker compose stop backend');
      console.error(`  or run this API on another port:     PORT=4001 pnpm dev:backend (then set NEXT_PUBLIC_API_URL / NEXT_PUBLIC_SOCKET_URL)\n`);
      process.exit(1);
    }
    throw err;
  });

  server.listen(config.port, () => {
    console.log('');
    console.log(`  MyGPT API   http://localhost:${config.port}/api/v1`);
    console.log(`  Health      http://localhost:${config.port}/health`);
    console.log(`  Data layer  ${getStore().kind}${config.useMockData ? ' (seeded fixtures, no DB required)' : ''}`);
    console.log(`  Realtime    Socket.IO${config.enableRedisAdapter ? ' + redis adapter' : ' (in-memory)'}`);
    console.log('');
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
