// https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/

/**
 * canmove
 */
interface CanMoveContext {
  name: string;
}
interface CanMoveAbstract {
  move(far: number): void
}
interface CanMoveOptional {
  onMove(): void
}
interface CanMove {
  tryMoving(): void
}
class CanMoveMixin implements CanMove {
  tryMoving(): void {
    this.move(90);
  }
}
interface CanMoveMixin extends CanMoveAbstract, CanMoveOptional, CanMoveContext {}
interface CanMoveExports extends CanMove, CanMoveOptional {}

/**
 * animal
 */
interface AnimalAbstract extends CanMoveAbstract {
}

interface AnimalContext extends CanMoveContext {
  _parent: RealAnimal;
}
interface AnimalOptional extends CanMoveOptional {
  onMoan(): void
}

interface Animal {
  moan(): void
}

@mix(CanMoveMixin)
class AnimalMixin implements Animal {
  moan(): void {
    this.move(90);
    this.tryMoving();
    this.onMove && this.onMove();
    this.onMoan && this.onMoan();
  }
}
interface AnimalMixin extends CanMove, AnimalContext, AnimalOptional, AnimalAbstract {};
interface AnimalExports extends CanMoveExports, Animal, AnimalOptional {}

class RealAnimal {
  _parent: RealAnimal;
  age: number = 0;
  /**
   * be sure `moan` has the same shape with `AnimalMixin.moan`
   */
  moan(): void {  }
}

@mix(AnimalMixin)
class Human extends RealAnimal implements AnimalAbstract {
  move(far: number): void {
    throw new Error("Method not implemented.");
  }
  sayWords() {
  }
}
interface Human extends AnimalExports {}

class Singhi extends Human {
  speak() {
    // this.
  }
}

function mix(C0: Function) {
  return function(target: Function) {
    // mix
  }
}

