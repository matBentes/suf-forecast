import { TimeUtil } from '../time';

describe('', () => {
  it('', () => {
    const time = TimeUtil.getUnixTimeForAFutureDay(1);
    const time2 = TimeUtil.getUnixTimeForAFutureDay(2);
    const time3 = TimeUtil.getUnixTimeForAFutureDay(0);

    console.log(time);
    console.log(time2);
    console.log(time3);
  });
});
