type PaymentsType = {
  [key: string]: number;
};

export const PaymentsPricesValue: PaymentsType = {
  '200': 1,
  '540': 3,
  '1080': 6,
  '200.00': 1,
  '540.00': 3,
  '1080.00': 6,
};

export enum PaymentsPrices {
  'One' = '200',
  'Three' = '540',
  'Six' = '1080',
}

export enum PaymentsDescription {
  'One' = 'Fakebot 1 месяц',
  'Three' = 'Fakebot 3 месяца',
  'Six' = 'Fakebot 6 месяцев',
}
