// import moment from 'moment';
// import _ from 'lodash';

// export default function calculate({
//   startingBalance,
//   startDate = moment(),
//   dueDateDayOfTheMonth,
//   zeroInterestEnd
// }) {
//   let currentDate = startDate;
//   let currentBalance = startingBalance;

//   const moneyDisplay = num => `$${num.toFixed(2)}`;

//   const nextDueDate = date => {
//     const currentDayOfMonth = date.date();
//     let returnDate = moment(date);
//     if(currentDayOfMonth >= dueDateDayOfTheMonth) {
//       returnDate.month(date.month()+1);
//     }
//     return returnDate.date(dueDateDayOfTheMonth);
//   }

//   const getPaymentsLeft = date => {
//     let pointer = moment(date);
//     let count = 0;
//     while(pointer.isSameOrBefore(zeroInterestEnd)) {
//       pointer = nextDueDate(pointer);
//       count++;
//     }
//     return count;
//   }

//   let returnArray = [];
  
//   while(currentBalance > 0 && currentDate.isBefore(zeroInterestEnd)) {
//     let item = {};

//     currentDate = nextDueDate(currentDate);
//     item.date = currentDate;
//     item.dateString = currentDate.format('MMMM Do, Y');
    
//     let paymentsLeft = getPaymentsLeft(currentDate);
//     item.paymentsLeft = paymentsLeft;
    
//     const monthlyMinimumPayment = Math.max(Math.floor(currentBalance/100), 25);
//     let payment = monthlyMinimumPayment + Math.ceil(currentBalance/paymentsLeft);
//     item.payment = `-${moneyDisplay(payment)}`;
    
//     currentBalance -= payment;
// 	  item.balance = moneyDisplay(currentBalance);
    
//     returnArray.push(item);
//   }
//   return returnArray;
// };