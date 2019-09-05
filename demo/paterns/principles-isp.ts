//输入模块接口
interface InputModule {
  insert(): void
  delete(): void
  modify(): void
}
//统计模块接口
interface CountModule {
  countTotalScore(): void
  countAverage(): void
}
//打印模块接口
interface PrintModule {
  printStuInfo(): void
  queryStuInfo(): void
}

//实现类
class StuScoreList implements InputModule, CountModule, PrintModule {
  constructor() { }

  static getInputModule(): InputModule {
    return new StuScoreList()
  }
  static getCountModule(): CountModule {
    return new StuScoreList()
  }
  static getPrintModule(): PrintModule {
    return new StuScoreList()
  }

  insert() {
    console.log("输入模块的 insert()方法被调用！")
  }
  delete() {
    console.log("输入模块的 delete()方法被调用！")
  }
  modify() {
    console.log("输入模块的 modify()方法被调用！")
  }
  countTotalScore() {
    console.log("统计模块的 countTotalScore()方法被调用！")
  }
  countAverage() {
    console.log("统计模块的 countAverage()方法被调用！")
  }
  printStuInfo() {
    console.log("打印模块的 printStuInfo()方法被调用！")
  }
  queryStuInfo() {
    console.log("打印模块的 queryStuInfo()方法被调用！")
  }
}

class ISPtest {
  static main() {
    const input: InputModule = StuScoreList.getInputModule()
    const count: CountModule = StuScoreList.getCountModule()
    const print: PrintModule = StuScoreList.getPrintModule()
    input.insert()
    count.countTotalScore()
    print.printStuInfo()
  }
}

ISPtest.main()
