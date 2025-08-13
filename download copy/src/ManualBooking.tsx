import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';  // Adjust path if needed

interface Customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
}

const ManualBooking = () => {
  const [step, setStep] = useState(1);  // 1: Customer, 2: Service, 3: Date/Time, 4: Confirm
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const custQ = query(collection(db, 'customers'), where('businessId', '==', user.uid));
      const servQ = query(collection(db, 'services'), where('businessId', '==', user.uid));
      const custUnsub = onSnapshot(custQ, (snapshot) => {
        setCustomers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Customer)));
      });
      const servUnsub = onSnapshot(servQ, (snapshot) => {
        setServices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Service)));
        setLoading(false);
      });
      return () => { custUnsub(); servUnsub(); };
    }
    setLoading(false);
  }, []);

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'appointments'), {
          customerId: selectedCustomer,
          serviceId: selectedService,
          date,
          time,
          businessId: user.uid,
        });
        // Reset or redirect
        setStep(1);
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <button onClick={() => window.history.back()} className="text-blue-400 mb-4">← Back to Dashboard</button>
      <h1 className="text-2xl font-bold mb-4">Manual Appointment Booking</h1>
      {step === 1 && (
        <div>
          <h2 className="text-lg mb-2">Select Customer</h2>
          <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="block w-full mb-4 p-2 bg-gray-700 rounded">
            <option value="">Choose Customer</option>
            {customers.map((cust) => <option key={cust.id} value={cust.id}>{cust.name}</option>)}
          </select>
          <button onClick={() => setStep(2)} disabled={!selectedCustomer} className="bg-blue-600 px-4 py-2 rounded">Next</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2 className="text-lg mb-2">Select Service</h2>
          <select value={selectedService} onChange=(e) => setSelectedService(e.target.value) className="block w-full mb-4 p-2 bg-gray-700 rounded">
            <option value="">Choose Service</option>
            {services.map((serv) => <option key={serv.id} value={serv.id}>{serv.name}</option>)}
          </select>
          <button onClick={() => setStep(1)} className="bg-gray-600 px-4 py-2 rounded mr-2">Back</button>
          <button onClick={() => setStep(3)} disabled={!selectedService} className="bg-blue-600 px-4 py-2 rounded">Next</button>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2 className="text-lg mb-2">Select Date and Time</h2>
          <input type="date" value={date} onChange=(e) => setDate(e.target.value) className="block w-full mb-2 p-2 bg-gray-700 rounded" />
          <input type="time" value={time} onChange=(e) => setTime(e.target.value) className="block w-full mb-4 p-2 bg-gray-700 rounded" />
          <button onClick={() => setStep(2)} className="bg-gray-600 px-4 py-2 rounded mr-2">Back</button>
          <button onClick={() => setStep(4)} disabled={!date || !time} className="bg-blue-600 px-4 py-2 rounded">Next</button>
        </div>
      )}
      {step === 4 && (
        <div>
          <h2 className="text-lg mb-2">Confirm Booking</h2>
          <p>Customer: {customers.find((c) => c.id === selectedCustomer)?.name}</p>
          <p>Service: {services.find((s) => s.id === selectedService)?.name}</p>
          <p>Date: {date}</p>
          <p>Time: {time}</p>
          <button onClick={() => setStep(3)} className="bg-gray-600 px-4 py-2 rounded mr-2">Back</button>
          <button onClick={handleSubmit} className="bg-green-600 px-4 py-2 rounded">Confirm</button>
        </div>
      )}
    </div>
  );
};

export default ManualBooking;