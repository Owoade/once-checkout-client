export interface OncePayload {
    amount: number;
    successCallback: Function;
  }
  
 export  interface OnceInitialize {
    message: string;
    transaction_ref: string;
    url: string;
  }