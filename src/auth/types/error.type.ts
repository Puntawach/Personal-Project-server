export type PrismaDriverAdapterError = {
  name: string;
  cause: {
    originalCode: string;
    originalMessage: string;
    kind: string;
    constraint: {
      fields: string[];
    };
  };
};

export type PrismaErrorMeta = {
  modelName?: string;
  target?: string[];
  driverAdapterError?: PrismaDriverAdapterError;
};
