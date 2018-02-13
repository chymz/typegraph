import { IResolveContext } from './IResolveContext';
export interface ITypeGraphOptions {
  query: any;
  mutation?: any;
  context?: any;
  port?: number;
  host?: string;
  playground?: boolean;
  voyager?: boolean;
}
