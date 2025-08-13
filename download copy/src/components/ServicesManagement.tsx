import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';  // Adjust path if needed
import AddServiceModal from './AddServiceModal';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

const ServicesManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const q = query(collection(db, 'services'), where('businessId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Service));
        setServices(data);
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
          <h1 className="text-2xl font-bold">Services & Pricing</h1>
          <p>Manage your services and set competitive pricing.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-4 py-2 rounded">+ Add Service</button>
      </div>
      {services.length === 0 ? (
        <div className="text-center">
          <div className="text-6xl mb-4">✂️</div>
          <p className="text-xl mb-2">No services yet</p>
          <p>Add your first service to start accepting bookings.</p>
          <button onClick={() => setIsModalOpen(true)} className="bg-white text-black mt-4 px-4 py-2 rounded">+ Add Your First Service</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-gray-800 p-4 rounded">
              <h3 className="text-lg">{service.name}</h3>
              <p>{service.description}</p>
              <p>Price: ${service.price} | Duration: {service.duration} min</p>
              {/* Add edit/delete later */}
            </div>
          ))}
        </div>
      )}
      {isModalOpen && <AddServiceModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default ServicesManagement;