import axios from "axios";
import { io } from "socket.io-client";

export default class Once {
  payload: OncePayload;

  constructor(payload: OncePayload) {
    this.payload = payload ?? {};
  }

  protected validatePayload() {
    const { amount, successCallback } = this.payload;
    // cases
    const MISSING_PAYLOAD = !("amount" in this.payload)
      ? "amount"
      : null ?? !("successCallback" in this.payload)
      ? "successCallback"
      : null;

    const TYPE_MISMATCH = !(typeof amount === "number")
      ? "amount"
      : null ?? !(typeof successCallback === "function")
      ? "successCallback"
      : null;

    return { missingPayload: MISSING_PAYLOAD, typeMismatch: TYPE_MISMATCH };
  }

    /**
   * Initialize checkout
   */

  async checkout() {
    const errors = this.validatePayload();
    //   No errors
    const NO_ERROR = Object.values(errors).every(
      (error: string | null) => !Boolean(error)
    );

    if (NO_ERROR) {
      const checkout = await this.getCheckoutLink();
      this.setUpEvents(checkout.transaction_ref);
      window.open(
        checkout.url,
        "New Window",
        `width=500,height=700,top=${(screen.height - 700) / 4},left=${
          (screen.width - 500) / 2
        }`
      );
      return;
    }

    Boolean(errors.missingPayload) &&
      console.error(
        `Payload object must contain '${errors.missingPayload}' property `
      );

    Boolean(errors.typeMismatch) &&
      console.error(
        `${errors.typeMismatch} must be of type ${
          errors.typeMismatch === "amount" ? "number" : "function"
        }`
      );
  }

  protected async getCheckoutLink() {
    const data = {
      amount: this.payload.amount,
      host: window.location.host ?? "",
    };

    const res = await axios.post("https://once-api.herokuapp.com/init", data);

    return res.data as OnceInitialize;
  }

  protected setUpEvents(ref: string) {
    const socket = io("https://once-api.herokuapp.com/transaction");

    console.log(ref);

    socket.emit("transaction-init", ref);

    socket.on("transaction-resolved", this.payload.successCallback as any);
  }
}
  
  interface OncePayload {
    amount: number;
    successCallback: Function;
  }
  
  interface OnceInitialize {
    message: string;
    transaction_ref: string;
    url: string;
  }