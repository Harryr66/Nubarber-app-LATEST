import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';  // Adjust path if needed
import AddStaffModal from './AddStaffModal';

interface Staff {
  id: string;
  name: string;
  email: string;
  title: string;
  photo?: string;  // Optional photo URL
}

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const q = query(collection(db, 'staff'), where('businessId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Staff));
        setStaff(data);
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
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p>Manage your team members.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-4 py-2 rounded">+ Add Staff Member</button>
      </div>
      {staff.length === 0 ? (
        <div className="text-center">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-xl mb-2">No staff yet</p>
          <p>Add your first staff member.</p>
          <button onClick={() => setIsModalOpen(true)} className="bg-white text-black mt-4 px-4 py-2 rounded">+ Add Staff Member</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {staff.map((member) => (
            <div key={member.id} className="bg-gray-800 p-4 rounded">
              <h3 className="text-lg">{member.name}</h3>
              <p>Email: {member.email}</p>
              <p>Title: {member.title}</p>
              {member.photo && <img src={member.photo} alt="Photo" className="w-20 h-20 rounded-full" />}
              {/* Add edit/delete later */}
            </div>
          ))}
        </div>
      )}
      {isModalOpen && <AddStaffModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default StaffManagement;