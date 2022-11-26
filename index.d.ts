interface OncePayload {
    amount: number;
    successCallback: Function;
  }
  
  interface OnceInitialize {
    message: string;
    transaction_ref: string;
    url: string;
  }