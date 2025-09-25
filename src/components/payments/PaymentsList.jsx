import React, { useEffect, useState } from 'react';
import { getLatePayments } from '../../services/endpoints';

export default function PaymentsList() {
  const [payments, setPayments] = useState([]);
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await getLatePayments({ month: currentMonth });
        setPayments(data.data.unpaidStudents);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to fetch payments');
      }
    };

    fetchPayments();
  }, [currentMonth]);

  return (
    <div>
      <h2>Late Payments for Month {currentMonth}</h2>
      {payments.length > 0 ? (
        payments.map((student) => (
          <div key={student._id}>
            <p>
              {student.fullName} - {student.academicLevel} ({student.groupCode})
            </p>
          </div>
        ))
      ) : (
        <p>No late payments!</p>
      )}
    </div>
  );
}
