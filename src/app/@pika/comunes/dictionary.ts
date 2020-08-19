export class Dictionary {
  items = {};
  constructor() {
    this.items = {};
  }
  public clear() {
    this.items = {};
  }
  public has(key: string) {
    return key.toLowerCase() in this.items;
  }
  public set(key: string, value: any) {
    this.items[key.toLowerCase()] = value;
  }
  public get(key: string) {
    return this.items[key.toLowerCase()];
  }
  public delete(key: string) {
    if (this.has(key)) {
      delete this.items[key.toLowerCase()];
      return true;
    }
    return false;
  }
}
