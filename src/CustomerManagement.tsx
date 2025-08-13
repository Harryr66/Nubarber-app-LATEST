import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, QuerySnapshot, DocumentData } from 'firebase/firestore';
import AddCustomerModal from './AddCustomerModal';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      const customersCollection = collection(db, 'customers');
      const customersSnapshot: QuerySnapshot<DocumentData> = await getDocs(customersCollection);
      const customersList: Customer[] = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(customersList);
    };
    fetchCustomers();
  }, []);

  const handleAddOrUpdate = async (customerData: Omit<Customer, 'id'>) => {
    if (editCustomer) {
      const customerRef = doc(db, 'customers', editCustomer.id);
      await updateDoc(customerRef, customerData);
    } else {
      await addDoc(collection(db, 'customers'), customerData);
    }
    setIsModalOpen(false);
    setEditCustomer(null);
    // Re-fetch
    const customersSnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'customers'));
    setCustomers(customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
  };

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'customers', id));
    // Re-fetch
    const customersSnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'customers'));
    setCustomers(customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
  };

  return (
    <div className="p-4 bg-white min-h-screen text-black">
      <button onClick={() => { setEditCustomer(null); setIsModalOpen(true); }} className="bg-blue-500 text-white p-2 rounded mb-4">Add Customer</button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {customers.map((customer) => (
          <div key={customer.id} className="p-4 bg-gray-100 rounded shadow">
            <h3 className="text-lg font-bold">{customer.name}</h3>
            <p>Email: {customer.email}</p>
            <p>Phone: {customer.phone}</p>
            <p>Notes: {customer.notes}</p>
            <button onClick={() => handleEdit(customer)} className="bg-yellow-500 text-white p-1 rounded mr-2">Edit</button>
            <button onClick={() => handleDelete(customer.id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <AddCustomerModal onClose={() => { setIsModalOpen(false); setEditCustomer(null); }} onAdd={handleAddOrUpdate} initialData={editCustomer || { name: '', email: '', phone: '', notes: '' }} />
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;