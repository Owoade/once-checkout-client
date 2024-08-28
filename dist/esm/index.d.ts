import { OnceInitialize, OncePayload } from "./types/types.js";
export default class Once {
    payload: OncePayload;
    constructor(payload: OncePayload);
    protected validatePayload(): {
        missingPayload: string | null;
        typeMismatch: string | null;
    };
    /**
   * Initialize checkout
   */
    checkout(): Promise<void>;
    protected getCheckoutLink(): Promise<OnceInitialize>;
    protected setUpEvents(ref: string): void;
}
