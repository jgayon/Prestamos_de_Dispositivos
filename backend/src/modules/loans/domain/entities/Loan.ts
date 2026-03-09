import { LoanState } from '../state/LoanState';
import { RequestedState } from '../state/RequestedState';
import { ApprovedState } from '../state/ApprovedState';
import { DeliveredState } from '../state/DeliveredState';
import { ReturnedState } from '../state/ReturnedState';
import { ExpiredState } from '../state/ExpiredState';

export class Loan {
  public states: any;
  private currentState: LoanState;

  // metadata added for demonstration of factory/composite
  public type?: string;
  public items?: any[];

  constructor(public id: string, type?: string, items?: any[]) {
    this.type = type;
    this.items = items;

    this.states = {
      requested: new RequestedState(this),
      approved: new ApprovedState(this),
      delivered: new DeliveredState(this),
      returned: new ReturnedState(this),
      expired: new ExpiredState(this),
    };

    this.currentState = this.states.requested;
  }

  setState(state: LoanState) {
    this.currentState = state;
  }

  getState(): string {
    return this.currentState.getName();
  }

  request() {
    this.currentState.request();
  }

  approve() {
    this.currentState.approve();
  }

  deliver() {
    this.currentState.deliver();
  }

  return() {
    this.currentState.return();
  }

  expire() {
    this.currentState.expire();
  }
}