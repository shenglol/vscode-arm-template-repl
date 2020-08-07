import { debounce } from "../../../utils/functions";
import { useFakeTimers, spy } from "sinon";
import { expect } from "chai";

describe("debounce", () => {
  let clock: ReturnType<typeof useFakeTimers>;

  beforeEach(function () {
    clock = useFakeTimers();
  });

  afterEach(function () {
    clock.restore();
  });

  it("does not call function before timeout", () => {
    const func = spy();
    const debounced = debounce(func, 10);

    debounced();
    clock.tick(9);

    expect(func.notCalled).true;
  });

  it("calls function after timeout", () => {
    const func = spy();
    const debounced = debounce(func, 10);

    debounced();
    clock.tick(11);

    expect(func.calledOnce).true;
  });
});
