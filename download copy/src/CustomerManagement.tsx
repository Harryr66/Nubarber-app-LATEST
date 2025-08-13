import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';  // Adjust path if needed
import AddCustomerModal from './AddCustomerModal';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const q = query(collection(db, 'customers'), where('businessId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Customer));
        setCustomers(data);
        setLoading(false);
      });
      return unsubscribe;
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <button onClick={() => window.history.back()} className="text-blue-400 mb-4">← Back to Dashboard</button>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <p>Manage your client database.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-4 py-2 rounded">+ Add Customer</button>
      </div>
      {customers.length === 0 ? (
        <div className="text-center">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-xl mb-2">No customers yet</p>
          <p>Add your first customer.</p>
          <button onClick={() => setIsModalOpen(true)} className="bg-white text-black mt-4 px-4 py-2 rounded">+ Add Customer</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {customers.map((customer) => (
            <div key={customer.id} className="bg-gray-800 p-4 rounded">
              <h3 className="text-lg">{customer.name}</h3>
              <p>Email: {customer.email}</p>
              <p>Phone: {customer.phone}</p>
              <p>Notes: {customer.notes}</p>
              {/* Add edit/delete later */}
            </div>
          ))}
        </div>
      )}
      {isModalOpen && <AddCustomerModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default CustomerManagement;