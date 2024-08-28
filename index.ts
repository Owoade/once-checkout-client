import axios from "axios";
import { io } from "socket.io-client";
import {OnceInitialize, OncePayload} from "./types/types.js"
import { BASE_URL } from "./utils.js";

let clicked = false;

export  default class  Once {

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

    if( clicked ) return

    clicked = true;

    setTimeout(()=> clicked = false, 5000 )

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

      clicked = true;

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

    const res = await axios.post(`${BASE_URL}/init`, data);

    return res.data as OnceInitialize;
  }

  protected setUpEvents(ref: string) {

    const socket = io(`${BASE_URL}/transaction`);

    socket.emit("transaction-init", ref);

    socket.on("transaction-resolved", this.payload.successCallback as any);

  }


}
  
