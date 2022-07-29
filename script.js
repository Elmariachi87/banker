'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Joe Hookham',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2021-11-18T21:31:17.178Z',
    '2021-12-23T07:42:02.383Z',
    '2022-01-28T09:15:04.904Z',
    '2022-04-01T10:17:24.185Z',
    '2022-05-08T14:11:59.604Z',
    '2022-07-23T17:01:17.194Z',
    '2022-07-26T23:36:17.929Z',
    '2022-07-27T10:51:36.790Z',
  ],
  currency: 'GBP',
  locale: 'en-UK',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) {
    return 'Today';
  }
  if (daysPassed === 1) {
    return 'Yesterday';
  }
  if (daysPassed <= 7) {
    return `${daysPassed} days ago`;
  }
  // We can find the connected date by accessing the index (i) of the acc.movementsDates array
  // const day = `${date.getDate()}`.padStart(2, 0); // adds a 0 if it's just a single digit
  // const month = `${date.getMonth() + 1}`.padStart(2, 0); // add 1 because the month is zero based
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

// Fake always logged in
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0); // adds a 0 if it's just a single digit
    // const month = `${now.getMonth() + 1}`.padStart(2, 0); // add 1 because the month is zero based
    // const year = now.getFullYear();
    // const hour = now.getHours();
    // const min = `${now.getMinutes()}`.padStart(2, 0);

    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Experimenting with API
    const now = new Date();

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', // can also write 'long' / 'short' for the word, or '2-digit' to add 0 infront
      year: 'numeric',
    };

    // const locale = navigator.language;

    // You can pass in an object if you want to specify how it's displayed
    // To assign it to a locale, you can write the int code such as 'en-GB'.
    // However, it's best to acquire the locale from the user's browser (navigator.language)
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

// ===== TRANSFERS =====

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
});

// ===== LOANS =====
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Add loan date
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.acc.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// ===== 170 - Converting and checking numbers =====

// All numbers are floating point numbers (decimals)
// Base 10 = 0-9
// Binary base 2 = 0 1

// JS struggles with representing some numbers as it uses binary - so it's not good for very precise maths

// console.log(0.1 + 0.2); // 0.30000000000000004
// console.log(0.1 + 0.2 === 0.3); // false

// // Convert to a number
// console.log(Number(23));
// // Using type coercion
// console.log(+'23');

// // Parsing

// console.log(Number.parseInt('30px', 10));

// // Has to start with a number
// console.log(Number.parseInt('£30', 10));
// // Add the '10' to show JS that we're working with base 10

// // With decimals
// console.log(Number.parseInt('2.5rem'));
// console.log(Number.parseFloat('2.5rem'));

// // Check if value is NAN
// console.log(Number.isNaN(20)); // false
// console.log(Number.isNaN('20')); // false
// console.log(Number.isNaN(+'20X')); // true
// console.log(Number.isNaN(23 / 0)); // false

// // Better way to check if something is a number
// console.log(Number.isFinite(20)); // true
// console.log(Number.isFinite('20')); // false
// console.log(Number.isFinite(+'20X')); // false
// console.log(Number.isFinite(23 / 0)); // false

// console.log(Number.isInteger(23)); // true
// console.log(Number.isInteger(23.0)); // true
// console.log(Number.isInteger(23 / 0)); // false

// ===== 171 - Math and rounding =====
/*
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

// Finding the highest num
console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2));
// Doesn't parse (can't have non number elements)
console.log(Math.max(5, 18, '23px', 11, 2));
console.log(Math.min(5, 18, 23, 11, 2));

console.log(Math.PI * Number.parseFloat('10px') ** 2);

console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20));
// 0.32 x 10 (max - min) = 3.20
// 3.20 + 1 = 4.20
// trunc 4.20 = 4
// 4 + min = 14

// Rounding integers
console.log(Math.trunc(23.3));

// Round to the nearest int
console.log(Math.round(23.3));
console.log(Math.round(23.9));

// Round up
console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

// Round down
console.log(Math.floor(23.3));
console.log(Math.floor(23.9));

// Rounding decimals
console.log((2.7).toFixed(0)); // 3
console.log((2.7).toFixed(3)); // 2.700
console.log((2.345).toFixed(2)); // 2.35


// ===== 172 - Remainder operator =====
console.log(5 % 2);
console.log(8 % 3);

// Check if something is even, divide it by 2 and expect remainder 0
console.log(6 % 2); // remainder 0
console.log(7 % 2); // remainder 1

// As a function - number will be divided by 2 and remainder checked for equality to 0 - which returns true / false
const isEven = n => n % 2 === 0;

console.log(isEven(3));

// Change the colour of every other movement row based on whether or not the index is odd or even

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orange';
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});


// ===== 173 - Numeric Separators =====

// 287,460,000,000
const diameter = 287_460_000_000;
console.log(diameter);

const priceCents = 345_99;
console.log(priceCents);

// not allowed after .
// const PI = 3._1415;

// Convert numbers to strings
console.log(Number('230_000')); //NaN



// ===== 174 - Working with bigInt =====
// This is the largest num that JS can represent safely
console.log(2 ** 53); // 9007199254740992
console.log(2 ** 53 + 1); // 9007199254740992

// It's the same as doing this:
console.log(Number.MAX_SAFE_INTEGER);

// Big Int number - add 'n' onto the end to display very large numbers accurately
console.log(91283719241293140923840239483n);
// This will return the same but not exactly, use it for smaller (large) numbers
console.log(BigInt(9128371924129314));

// Operations
console.log(10000n + 10000n);
console.log(
  17912319238719230309818723409239487n * 120398298749091093908723498n
);

// Can't mix 2 types - so use BigInt on the other number
const huge = 202300981908123810981231n;
const num = 23;
console.log(huge * BigInt(num));

// Exceptions to BigInt working
console.log(20n > 15); // true
console.log(20n === 20); // false
console.log(20n == '20'); // true
console.log(huge + ' is REALLY big!!!'); // converts to string

// Division
console.log(10n / 3n); // returns 3n (returns closest int)



// ===== 175 - Creating dates =====
const now = new Date();
console.log(now);

console.log();
console.log(new Date('Aug 02 2022 18:05:41'));
console.log(new Date('December 24, 2015'));

console.log(new Date(account1.movementsDates[0]));
// Months are 0 based, so November is 10 (not 11)
console.log(new Date(2037, 10, 19, 15, 23, 5)); // Thu Nov 19 2037 15:23:05 GMT+0000
// JS knows how many days are in a month, as Nov only has 30, it will push the date to the next day
console.log(new Date(2037, 10, 31)); // Tue Dec 01 2037 00:00:00 GMT+0000

// Amount of milliseconds since unix time
console.log(new Date(0)); // Thu Jan 01 1970 01:00:00 GMT+0100
// 3 days after unix time (3 days, 24 hours...)
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // Sun Jan 04 1970 01:00:00 GMT+0100

// Working with dates

const future = new Date(2037, 10, 19, 15, 23);
console.log(future);

console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate()); // day of the month
console.log(future.getDay()); // day of the week
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString()); // returns milliseconds
console.log(future.getTime());

console.log(new Date(2142256980000)); // returns date based on milliseconds
console.log(Date.now());

future.setFullYear(2040);
console.log(future);


// ===== 176 - Adding dates to Bankist App =====
// See Bankist app

// ===== 177 - Operations with dates =====

// Subtracting one date from another
const future = new Date(2037, 10, 19, 15, 23);

// When converted to a number, you can perform operations on the date.
console.log(+future);

// Convert the number into a date - 1000 milliseconds in a second, 60 seconds in a min etc.
const calcDaysPassed = (date1, date2) =>
  Math.abs((date2 - date1) / (1000 * 60 * 60 * 24));
//   Use Math.abs to get the absolute value (no negative) so that it doesn't matter which order the dates are put in

const days1 = calcDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14));
console.log(days1);

console.log(new Date(2037, 3, 4));


// ===== 178 - Internationalising dates =====
// See 'experimenting with API'

// ===== 179 - Internationalising numbers (INTL)
const num = 3884764.23;

const options = {
  style: 'currency', // 3 options: unit, percent, currency
  unit: 'celsius',
  currency: 'EUR',
  useGrouping: true, // false = removes separators
};

console.log('US:', new Intl.NumberFormat('en-US', options).format(num));
console.log('DE:', new Intl.NumberFormat('de-DE', options).format(num));
console.log('SY:', new Intl.NumberFormat('ar-SY', options).format(num));

 console.log(
   navigator.language,
   new Intl.NumberFormat(navigator.language).format(num)
 ); // en-GB 3,884,764.23

*/
