import { Loan } from '../entities/Loan';
import { LoanFactory } from './LoanFactory';

import { Device } from '../composite/Device';
import { Kit } from '../composite/Kit';

export class KitLoanFactory implements LoanFactory {

  createLoan(id: string): Loan {

    const laptop = new Device("device1", "Laptop", "AVAILABLE");
    const charger = new Device("device2", "Charger", "AVAILABLE");

    const kit = new Kit("kit1", "Laptop Kit");

    kit.add(laptop);
    kit.add(charger);

    console.log("Kit creado con dispositivos:", kit.getItems().length);

    return new Loan(id);

  }

}