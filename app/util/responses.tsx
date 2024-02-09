export interface packet {
  status: number;
  message: any;
  data: any;
}

export interface event_packet {
  type: String;
  data: any;
}
