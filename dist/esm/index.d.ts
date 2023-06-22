import { AxiosResponse } from "axios";
import { Socket } from "socket.io-client";

declare module "checkout-once" {
  export interface OncePayload {
    amount?: number;
    successCallback?: Function;
  }

  export interface OnceInitialize {
    transaction_ref: string;
    url: string;
    // Add other properties as needed
  }

  export default class Once {
    payload: OncePayload;

    constructor(payload?: OncePayload);

    protected validatePayload(): {
      missingPayload: keyof OncePayload | null;
      typeMismatch: keyof OncePayload | null;
    };

    checkout(): Promise<void>;

    protected getCheckoutLink(): Promise<OnceInitialize>;

    protected setUpEvents(ref: string): void;
  }

  export function axiosPost(url: string, data: any): Promise<AxiosResponse>;

  export function ioClient(url: string): Socket;
}
