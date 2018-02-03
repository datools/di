export interface IServiceProvider {
  provide?: any;
  name?: string;
  useFactory?: () => any;
  useValue?: any;
  useExisting?: any;
  deps?: any[];
}
