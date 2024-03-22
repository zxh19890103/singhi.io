// https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/

/**
 * 对于  mixin，不要在 initialize 里给字段赋值，建议直接在构造函数，或者直接字段声明的同时赋值
 */

/**
 * canmove
 */
interface CanMoveContext {
  name: string
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
    this.move(90)
  }
}
interface CanMoveMixin
  extends CanMoveAbstract,
    CanMoveOptional,
    CanMoveContext {}
interface CanMoveExports extends CanMove, CanMoveOptional {}

/**
 * animal
 */
type AnimalAbstract = CanMoveAbstract

interface AnimalContext extends CanMoveContext {
  _parent: RealAnimal
}
interface AnimalOptional extends CanMoveOptional {
  onRoar(): void
}

interface Animal {
  roar(): void
}

@mix(CanMoveMixin)
class AnimalMixin implements Animal {
  roar(): void {
    this.move(90)
    this.tryMoving()
    this.onMove && this.onMove()
    this.onRoar && this.onRoar()
  }
}
interface AnimalMixin
  extends CanMove,
    AnimalContext,
    AnimalOptional,
    AnimalAbstract {}
interface AnimalExports extends CanMoveExports, Animal, AnimalOptional {}

class RealAnimal {
  _parent: RealAnimal
  age = 0
  /**
   * be sure `moan` has the same shape with `AnimalMixin.moan`
   */
  roar(): void {}
}

@mix(AnimalMixin)
class Human extends RealAnimal implements AnimalAbstract {
  move(far: number): void {
    throw new Error("Method not implemented.")
  }
  sayWords() {}
}
interface Human extends AnimalExports {}

class Singhi extends Human {
  speak() {
    // this.
  }
}

interface Class {
  /**
   * Returns the name of the function. Function names are read-only and can not be changed.
   */
  readonly name: string
  prototype: any
}

function mix(C0: any) {
  return function (target: any) {
    // mix
  }
}

export { Singhi }
