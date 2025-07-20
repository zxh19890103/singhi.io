export class PlayForm {
  #_element: HTMLDivElement;
  #_form: HTMLFormElement;

  private spies: Record<string, SpyFn> = {};
  private promise: Promise<void> = null;
  private promiseDone: (val: any) => void;

  get element() {
    return this.#_element;
  }

  set element(el: HTMLDivElement) {
    this.#_element = el;
    this.#_form = el.querySelector("form");
  }

  focus() {
    if (!this.#_element) {
      return;
    }

    if (this.promise) return;
    this.#_element.classList.add(
      "inputting",
      "animate__animated",
      "animate__tada",
    );

    this.spies = {};
    this.promise = new Promise((done) => {
      this.promiseDone = done;
    });
  }

  blur() {
    this.promiseDone?.(1);
    this.promiseDone = null;
    this.promise = null;
    this.spies = null;
    this.#_element.classList.remove("inputting");
  }

  spy<V = any>(field: string, fn: SpyFn<V>) {
    if (!this.promise) return;
    this.spies[field] = fn;
  }

  _callSpy(field: string, value: any) {
    if (this.spies && this.spies[field]) {
      this.spies[field](value);
    }
  }

  wait(): Promise<any> {
    if (!this.promise) {
      return Promise.resolve();
    }

    return this.promise;
  }
}

type SpyFn<V = any> = (val: V) => void;
