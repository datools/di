export interface IServiceProvider {
  provide?: any;
  name?: string;
  useFactory?: (...args: any[]) => any;
  useValue?: any;
  useExisting?: any;
  deps?: any[];
}
