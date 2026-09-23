import { config } from '../config';
import type { DataStore } from './store';
import { MockStore } from './mock/mock-store';
import { PostgresStore } from './postgres/postgres-store';

let store: DataStore | undefined;

/** The only way services reach persistence. Chosen once by USE_MOCK_DATA. */
export function getStore(): DataStore {
  if (!store) {
    store = config.useMockData ? new MockStore() : new PostgresStore(config.databaseUrl);
  }
  return store;
}

export type { DataStore } from './store';
