import { DatabaseConfigurationError } from './errors';
import { createFileOrderRepository } from './fileRepository';
import { createPostgresOrderRepository } from './postgresRepository';
import { OrderRepository } from './repository';

let singleton: OrderRepository | null = null;

export function getOrderRepository(): OrderRepository {
  if (singleton) {
    return singleton;
  }

  const mode = process.env.ORDER_REPOSITORY || (process.env.NODE_ENV === 'production' ? 'postgres' : 'file');

  if (mode === 'postgres') {
    singleton = createPostgresOrderRepository();
    return singleton;
  }

  if (mode === 'file') {
    if (process.env.NODE_ENV === 'production') {
      throw new DatabaseConfigurationError('File repository is disabled in production');
    }

    singleton = createFileOrderRepository();
    return singleton;
  }

  throw new DatabaseConfigurationError(`Unsupported ORDER_REPOSITORY value: ${mode}`);
}

export function resetOrderRepositoryForTests(): void {
  singleton = null;
}
