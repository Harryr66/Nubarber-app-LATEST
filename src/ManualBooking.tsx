import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, QuerySnapshot, DocumentData } from 'firebase/firestore';

interface Customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

const ManualBooking = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [dateTime, setDateTime] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const customersSnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'customers'));
      setCustomers(customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));

      const servicesSnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'services'));
      setServices(servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'bookings'), {
      customerId: selectedCustomer,
      serviceId: selectedService,
      dateTime: new Date(dateTime),
    });
    // Clear form
    setSelectedCustomer('');
    setSelectedService('');
    setDateTime('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} required>
        <option value="">Select Customer</option>
        {customers.map((cust) => <option key={cust.id} value={cust.id}>{cust.name}</option>)}
      </select>
      <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} required>
        <option value="">Select Service</option>
        {services.map((serv) => <option key={serv.id} value={serv.id}>{serv.name}</option>)}
      </select>
      <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} required />
      <button type="submit">Book</button>
    </form>
  );
};

export default ManualBooking;