// 队列对象
class Queue {
  constructor() {
    this.ing = false;
    this.timer = undefined;
  }
  /**
   * [first 同一个函数多次执行，只执行第一次(可用于多次点击按钮，执行第一次操作就行)]
   * @param  {[type]} func         [需要调用的函数]
   * @param  {Number} [delay=1000] [检测事件间隔]
   */
  first(func, delay = 1000) {
    if (this.ing) return;
    this.ing = true;
    func();
    setTimeout(() => {
      this.ing = false;
    }, delay);
  }
  /**
   * [last 同一个函数多次执行，只执行最后一次（可用于监听 input 的 输入事件，以短时间内最后输入的内容为结果）]
   * @param  {[type]} func        [需要执行的函数]
   * @param  {Number} [delay=500] [检测的时间间隔]
   */
  last(func, delay = 500) {
    const queue = this;
    if (queue.timer) clearTimeout(queue.timer);
    return new Promise(function(resolve, reject) {
      queue.timer = setTimeout(() => {
        if (func.then) {
          func().then(() => {
            resolve();
          });
        } else {
          func();
          resolve();
        }
      }, delay);
    });
  }
}

export default Queue;
