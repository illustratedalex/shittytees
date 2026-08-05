import { getOrderRepository } from './index';
import { query } from './database';

export type OrderSystemHealth = {
  repositoryMode: string;
  databaseReachable: boolean;
};

export async function checkOrderSystemHealth(): Promise<OrderSystemHealth> {
  const repositoryMode = process.env.ORDER_REPOSITORY || (process.env.NODE_ENV === 'production' ? 'postgres' : 'file');

  if (repositoryMode !== 'postgres') {
    getOrderRepository();
    return {
      repositoryMode,
      databaseReachable: false,
    };
  }

  await query('SELECT 1 AS ok');
  return {
    repositoryMode,
    databaseReachable: true,
  };
}
