"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const socket_io_client_1 = require("socket.io-client");
const utils_js_1 = require("./utils.js");
let clicked = false;
class Once {
    constructor(payload) {
        this.payload = payload !== null && payload !== void 0 ? payload : {};
    }
    validatePayload() {
        const { amount, successCallback } = this.payload;
        // cases
        const MISSING_PAYLOAD = !("amount" in this.payload)
            ? "amount"
            : (null !== null && null !== void 0 ? null : !("successCallback" in this.payload))
                ? "successCallback"
                : null;
        const TYPE_MISMATCH = !(typeof amount === "number")
            ? "amount"
            : (null !== null && null !== void 0 ? null : !(typeof successCallback === "function"))
                ? "successCallback"
                : null;
        return { missingPayload: MISSING_PAYLOAD, typeMismatch: TYPE_MISMATCH };
    }
    /**
   * Initialize checkout
   */
    async checkout() {
        if (clicked)
            return;
        clicked = true;
        setTimeout(() => clicked = false, 5000);
        const errors = this.validatePayload();
        //   No errors
        const NO_ERROR = Object.values(errors).every((error) => !Boolean(error));
        if (NO_ERROR) {
            const checkout = await this.getCheckoutLink();
            this.setUpEvents(checkout.transaction_ref);
            window.open(checkout.url, "New Window", `width=500,height=700,top=${(screen.height - 700) / 4},left=${(screen.width - 500) / 2}`);
            clicked = true;
            return;
        }
        Boolean(errors.missingPayload) &&
            console.error(`Payload object must contain '${errors.missingPayload}' property `);
        Boolean(errors.typeMismatch) &&
            console.error(`${errors.typeMismatch} must be of type ${errors.typeMismatch === "amount" ? "number" : "function"}`);
    }
    async getCheckoutLink() {
        var _a;
        const data = {
            amount: this.payload.amount,
            host: (_a = window.location.host) !== null && _a !== void 0 ? _a : "",
        };
        const res = await axios_1.default.post(`${utils_js_1.BASE_URL}/init`, data);
        return res.data;
    }
    setUpEvents(ref) {
        const socket = (0, socket_io_client_1.io)(`${utils_js_1.BASE_URL}/transaction`);
        socket.emit("transaction-init", ref);
        socket.on("transaction-resolved", this.payload.successCallback);
    }
}
exports.default = Once;
