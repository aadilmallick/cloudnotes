import crypto from "node:crypto";

export class CryptoPasswordModel {
  private salt: string;
  private iterations: number;
  private keyLength: number;
  private digest: string;

  constructor(options?: {
    salt?: string;
    iterations?: number;
    keyLength?: number;
    digest?: string;
  }) {
    if (options) {
      this.salt = options.salt || crypto.randomBytes(16).toString("hex");
      this.iterations = options.iterations || 10;
      this.keyLength = options.keyLength || 64;
      this.digest = options.digest || "sha256";
    } else {
      this.salt = crypto.randomBytes(16).toString("hex");
      this.iterations = 10;
      this.keyLength = 64;
      this.digest = "sha256";
    }
  }

  async hash(password: string) {
    const { promise, resolve, reject } = Promise.withResolvers<Buffer>();
    crypto.pbkdf2(
      password,
      this.salt,
      this.iterations,
      this.keyLength,
      this.digest,
      (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(derivedKey);
      }
    );
    const hash = await promise;
    return hash.toString("hex");
  }

  toJSON() {
    return {
      salt: this.salt,
      iterations: this.iterations,
      keyLength: this.keyLength,
      digest: this.digest,
    };
  }

  static fromJSON(json: {
    salt: string;
    iterations: number;
    keyLength: number;
    digest: string;
  }) {
    return new CryptoPasswordModel({
      salt: json.salt,
      iterations: json.iterations,
      keyLength: json.keyLength,
      digest: json.digest,
    });
  }

  async verify(password: string, hash: string) {
    const { promise, resolve, reject } = Promise.withResolvers<boolean>();
    crypto.pbkdf2(
      password,
      this.salt,
      this.iterations,
      this.keyLength,
      this.digest,
      (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(derivedKey.toString("hex") === hash);
      }
    );
    const result = await promise;
    return result;
  }
}

class PromiseMessagingQueue<T, R> {
  private queue: {
    promise: Promise<R>;
    resolve: (value: R) => void;
    reject: (reason?: any) => void;
    args: T;
  }[] = [];
  private isProcessing = false;

  constructor(private onData: (data: T) => Promise<R>) {}

  async add(args: T) {
    const { resolve, reject, promise } = Promise.withResolvers<R>();
    this.queue.push({ promise, resolve, reject, args });
    await this.processQueue();
    return promise;
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;
    const { promise, resolve, reject, args } = this.queue.shift()!;
    try {
      const result = await this.onData(args);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.isProcessing = false;
      await this.processQueue();
    }
  }
}

const values: number[] = [];

const queue = new PromiseMessagingQueue<number, number>((message) => {
  values.push(message);
  return Promise.resolve(message);
});

async function main() {
  const num1 = await queue.add(1);
  const num2 = await queue.add(2);

  console.log(values);
}

// main();

function createCancelablePromise<T>(cb: () => Promise<T>) {
  const controller = new AbortController();
  const { promise, resolve, reject } = Promise.withResolvers<T>();
  controller.signal.addEventListener("abort", () => {
    reject(new Error("Canceled"));
    return;
  });
  cb().then((value) => {
    if (controller.signal.aborted) {
      reject(new Error("Canceled"));
      return;
    }
    resolve(value);
  });
  return { promise, cancel: () => controller.abort() };
}

async function main2() {
  const password = "password";
  const model = new CryptoPasswordModel();
  const hash = await model.hash(password);
  console.log(hash);
  const result = await model.verify(password, hash);
  console.log(result);
  const model2 = CryptoPasswordModel.fromJSON(model.toJSON());
  const result2 = await model2.verify(password, hash);
  console.log(result2);
}

main2();
