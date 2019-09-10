export class graphMessage {
  id: string;
  child: string;
  value: string;
  type: string


  constructor(id: string, child: string, value: string, type: string) {
    this.id = id;
    this.child = child;
    this.value = value;
    this.type = type;
  }
}
