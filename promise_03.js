const PENDING = "pending";
const REJECTED = "rejected";
const FULFILLED = "fulfilled";
function isFunction(func) {
  return typeof func === "function";
}

function isObject(obj) {
  return typeof obj === "object" && obj !== null;
}

function resolutionProcedure(promise, x, resolve, reject) {
  if (promise === x) {
    reject(new TypeError("promise and x refer to the same object"));
    return;
  }
  if (isObject(x) || isFunction(x)) {
    try {
      let then = x.then;
      if (isFunction(then)) {
        let isCalled = false;
        try {
          then.call(
            x,
            (y) => {
              if (isCalled) {
                return;
              }
              isCalled = true;
              resolutionProcedure(promise, y, resolve, reject);
            },
            (r) => {
              if (isCalled) {
                return;
              }
              isCalled = true;
              reject(r);
            }
          );
        } catch (error) {
          if (isCalled) {
            return;
          }
          isCalled = true;
          reject(error);
        }
      } else {
        resolve(x);
      }
    } catch (error) {
      reject(error);
    }
  } else {
    resolve(x);
  }
}

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
  then(onFulfilled, onRejected) {
    let x;
    // let [onFulfilled, onRejected] = Array.prototype.slice.call(arguments);
    if (!isFunction(onFulfilled)) {
      onFulfilled = (data) => {
        return data;
      };
    }
    if (!isFunction(onRejected)) {
      onRejected = (error) => {
        throw error;
      };
    }
    let promise2 = new PromiseA((resolve, reject) => {
      if (this.PromiseState === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              x = onFulfilled(this.PromiseResult);
              resolutionProcedure(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              x = onRejected(this.PromiseResult);
              resolutionProcedure(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      if (this.PromiseState === FULFILLED) {
        setTimeout(() => {
          try {
            x = onFulfilled(this.PromiseResult);
            resolutionProcedure(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
      if (this.PromiseState === REJECTED) {
        setTimeout(() => {
          try {
            x = onRejected(this.PromiseResult);
            resolutionProcedure(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
    });
    return promise2;
  }
  catch() {}
  finally() {}
}

let p2 = new PromiseA(function (resolve, reject) {
  console.log(2);
  setTimeout(() => {
    reject("failed");
  }, 2000);
});
console.log(3);
p2.then(
  (data) => {
    console.log("data");
    console.log(data);
  },
  (error) => {
    console.log(4);
    console.log(error);
  }
).then(
  (data) => {
    console.log("data");
    console.log(data);
  },
  (error) => {
    console.log(4);
    console.log(error);
  }
);
p2.then(
  (data) => {
    console.log(6);
    console.log(data);
  },
  (error) => {
    console.log(4);
    console.log(error);
  }
);
console.log(5);

PromiseA.defer = PromiseA.deferred = function () {
  let dfd = {};
  dfd.promise = new PromiseA((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

module.exports = PromiseA;

// const PENDING = "PENDING";
// const FULFILLED = "FULFILLED";
// const REJECTED = "REJECTED";
// const resolvePromise = (promise2, x, resolve, reject) => {
//   // ?????????????????????????????????????????????????????????????????????????????? promise  Promise/A+ 2.3.1
//   if (promise2 === x) {
//     return reject(
//       new TypeError("Chaining cycle detected for promise #<Promise>")
//     );
//   }
//   // Promise/A+ 2.3.3.3.3 ??????????????????
//   let called;
//   // ?????????????????????????????? ???????????????????????????????????????
//   if ((typeof x === "object" && x != null) || typeof x === "function") {
//     try {
//       // ???????????? resolve ?????????????????? reject ???????????? reject ??? resolve ????????????????????????  Promise/A+ 2.3.3.1
//       let then = x.then;
//       if (typeof then === "function") {
//         // ???????????? x.then????????? then.call ???????????? ?????? x.then ??????????????????Object.defineProperty  Promise/A+ 2.3.3.3
//         then.call(
//           x,
//           (y) => {
//             // ?????? promise ????????????????????????????????????
//             if (called) return;
//             called = true;
//             // ???????????????????????????????????? promise ????????? promise??? Promise/A+ 2.3.3.3.1
//             resolvePromise(promise2, y, resolve, reject);
//           },
//           (r) => {
//             // ????????????????????? Promise/A+ 2.3.3.3.2
//             if (called) return;
//             called = true;
//             reject(r);
//           }
//         );
//       } else {
//         // ?????? x.then ?????????????????????????????? resolve ????????????  Promise/A+ 2.3.3.4
//         resolve(x);
//       }
//     } catch (e) {
//       // Promise/A+ 2.3.3.2
//       if (called) return;
//       called = true;
//       reject(e);
//     }
//   } else {
//     // ?????? x ?????????????????????????????? resolve ????????????  Promise/A+ 2.3.4
//     resolve(x);
//   }
// };
// class Promise {
//   constructor(executor) {
//     this.status = PENDING;
//     this.value = undefined;
//     this.reason = undefined;
//     this.onResolvedCallbacks = [];
//     this.onRejectedCallbacks = [];
//     let resolve = (value) => {
//       if (this.status === PENDING) {
//         this.status = FULFILLED;
//         this.value = value;
//         this.onResolvedCallbacks.forEach((fn) => fn());
//       }
//     };
//     let reject = (reason) => {
//       if (this.status === PENDING) {
//         this.status = REJECTED;
//         this.reason = reason;
//         this.onRejectedCallbacks.forEach((fn) => fn());
//       }
//     };
//     try {
//       executor(resolve, reject);
//     } catch (error) {
//       reject(error);
//     }
//   }
//   then(onFulfilled, onRejected) {
//     //?????? onFufilled???onRejected ?????????????????????
//     //Promise/A+ 2.2.1 / Promise/A+ 2.2.5 / Promise/A+ 2.2.7.3 / Promise/A+ 2.2.7.4
//     onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
//     //???????????????????????????????????????????????????????????????????????????????????????????????? then ??? resolve ?????????
//     onRejected =
//       typeof onRejected === "function"
//         ? onRejected
//         : (err) => {
//             throw err;
//           };
//     // ???????????? then ????????????????????? promise  Promise/A+ 2.2.7
//     let promise2 = new Promise((resolve, reject) => {
//       if (this.status === FULFILLED) {
//         //Promise/A+ 2.2.2
//         //Promise/A+ 2.2.4 --- setTimeout
//         setTimeout(() => {
//           try {
//             //Promise/A+ 2.2.7.1
//             let x = onFulfilled(this.value);
//             // x???????????????proimise
//             resolvePromise(promise2, x, resolve, reject);
//           } catch (e) {
//             //Promise/A+ 2.2.7.2
//             reject(e);
//           }
//         }, 0);
//       }
//       if (this.status === REJECTED) {
//         //Promise/A+ 2.2.3
//         setTimeout(() => {
//           try {
//             let x = onRejected(this.reason);
//             resolvePromise(promise2, x, resolve, reject);
//           } catch (e) {
//             reject(e);
//           }
//         }, 0);
//       }
//       if (this.status === PENDING) {
//         this.onResolvedCallbacks.push(() => {
//           setTimeout(() => {
//             try {
//               let x = onFulfilled(this.value);
//               resolvePromise(promise2, x, resolve, reject);
//             } catch (e) {
//               reject(e);
//             }
//           }, 0);
//         });
//         this.onRejectedCallbacks.push(() => {
//           setTimeout(() => {
//             try {
//               let x = onRejected(this.reason);
//               resolvePromise(promise2, x, resolve, reject);
//             } catch (e) {
//               reject(e);
//             }
//           }, 0);
//         });
//       }
//     });
//     return promise2;
//   }
// }

// Promise.defer = Promise.deferred = function () {
//   let dfd = {};
//   dfd.promise = new Promise((resolve, reject) => {
//     dfd.resolve = resolve;
//     dfd.reject = reject;
//   });
//   return dfd;
// };

// module.exports = Promise;
