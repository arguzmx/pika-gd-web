export interface TablaEventObject {
  event: string;
  value: {
    limit: number;
    page: number;
    key: string;
    order: string;
  };
}
