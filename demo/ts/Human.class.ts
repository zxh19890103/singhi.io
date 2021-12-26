import { AbstractAnimal, Animal } from "./Animal.class";

export class Human implements AbstractAnimal {
}

export interface Human extends Animal { };

export class Xinghai extends Human {
  moan() {
    return this;
  }
}
