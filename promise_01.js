const PENDING = "pending";
const REJECTED = "rejected";
const FULFILLED = "fulfilled";
class PromiseA {
  constructor() {
    this.PromiseState = PENDING;
    this.PromiseResult = undefined;
  }
  catch() {}
  finally() {}
  then() {}
}
