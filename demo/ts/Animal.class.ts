export interface AbstractAnimal {
  onChange():void
}

export class Animal {}

export interface Animal extends AbstractAnimal {};
