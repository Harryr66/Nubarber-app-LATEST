import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, QuerySnapshot, DocumentData } from 'firebase/firestore';
import AddServiceModal from './AddServiceModal';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

const ServicesManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editService, setEditService] = useState<Service | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      const servicesCollection = collection(db, 'services');
      const servicesSnapshot: QuerySnapshot<DocumentData> = await getDocs(servicesCollection);
      const servicesList: Service[] = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(servicesList);
    };
    fetchServices();
  }, []);

  const handleAddOrUpdate = async (serviceData: Omit<Service, 'id'>) => {
    if (editService) {
      const serviceRef = doc(db, 'services', editService.id);
      await updateDoc(serviceRef, serviceData);
    } else {
      await addDoc(collection(db, 'services'), serviceData);
    }
    setIsModalOpen(false);
    setEditService(null);
    // Re-fetch
    const servicesSnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'services'));
    setServices(servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
  };

  const handleEdit = (service: Service) => {
    setEditService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'services', id));
    // Re-fetch
    const servicesSnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'services'));
    setServices(servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
  };

  return (
    <div className="p-4 bg-white min-h-screen text-black">
      <button onClick={() => { setEditService(null); setIsModalOpen(true); }} className="bg-blue-500 text-white p-2 rounded mb-4">Add Service</button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.id} className="p-4 bg-gray-100 rounded shadow">
            <h3 className="text-lg font-bold">{service.name}</h3>
            <p>Duration: {service.duration} min</p>
            <p>Price: ${service.price}</p>
            <button onClick={() => handleEdit(service)} className="bg-yellow-500 text-white p-1 rounded mr-2">Edit</button>
            <button onClick={() => handleDelete(service.id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <AddServiceModal onClose={() => { setIsModalOpen(false); setEditService(null); }} onAdd={handleAddOrUpdate} initialData={editService || { name: '', duration: 0, price: 0 }} />
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;