const PENDING = "pending";
const REJECTED = "rejected";
const FULFILLED = "fulfilled";
class PromiseA {
  constructor(expression) {
    this.PromiseState = PENDING;
    this.PromiseResult = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    let resolve = (value) => {
      if (this.PromiseState === PENDING) {
        this.PromiseState = FULFILLED;
        this.PromiseResult = value;
        this.onFulfilledCallbacks.forEach((cb) => {
          cb();
        });
      }
    };
    let reject = (reason) => {
      if (this.PromiseState === PENDING) {
        this.PromiseState = REJECTED;
        this.PromiseResult = reason;
        this.onRejectedCallbacks.forEach((cb) => {
          cb();
        });
      }
    };
    expression(resolve, reject);
  }
  then() {
    let [onFulfilled, onRejected] = Array.prototype.slice.call(arguments);
    if (this.PromiseState === PENDING) {
      this.onFulfilledCallbacks.push(() => {
        onFulfilled(this.PromiseResult);
      });
      this.onRejectedCallbacks.push(() => {
        onRejected(this.PromiseResult);
      });
    }
    if (this.PromiseState === FULFILLED) {
      setTimeout(() => {
        onFulfilled(this.PromiseResult);
      });
    }
    if (this.PromiseState === REJECTED) {
      setTimeout(() => {
        onRejected(this.PromiseResult);
      });
    }
  }
  catch() {}
  finally() {}
}

let p2 = new Promise(function (resolve, reject) {
  console.log(2);
  setTimeout(() => {
    resolve("success");
  }, 2000);
});
console.log(3);
p2.then((data) => {
  console.log(4);
  console.log(data);
});
p2.then((data) => {
  console.log(6);
  console.log(data);
});
console.log(5);
