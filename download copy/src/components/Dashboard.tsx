import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';  // Adjust path

interface Business {
  id: string;
  name: string;
  // Add more fields
}

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUserEmail(user ? user.email : null);
      if (user) {
        const q = query(collection(db, 'businesses'), where('ownerId', '==', user.uid));
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            setBusiness({ id: doc.id, ...doc.data() } as Business);
          }
          setLoading(false);
        });
        return () => unsubscribeFirestore();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    // Redirect to login
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <button className="bg-white text-black px-4 py-2 rounded">View Your Website</button>
          <button className="bg-gray-700 px-4 py-2 rounded">Website Settings</button>
          <button className="bg-gray-700 px-4 py-2 rounded">Admin Settings</button>
        </div>
      </header>
      <h2 className="text-xl mb-4">Welcome back, {userEmail?.split('@')[0]}</h2>
      <div className="flex gap-4 mb-6">
        <button className="bg-blue-600 px-4 py-2 rounded">Manual Appointment Booking</button>
        <button className="bg-red-600 px-4 py-2 rounded">Support Ticket</button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg">Services Management</h3>
          <p>Manage your services, pricing, and availability settings.</p>
          <Link to="/services" className="bg-blue-600 mt-2 px-4 py-2 rounded inline-block text-white">Manage Services</Link>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg">Staff Management</h3>
          <p>Manage your team and set working schedules for staff.</p>
          <Link to="/staff" className="bg-blue-600 mt-2 px-4 py-2 rounded inline-block text-white">Manage Staff</Link>
        </div>
      </div>
      {/* Add more dashboard sections as needed */}
      <button onClick={handleLogout} className="mt-6 bg-red-600 px-4 py-2 rounded">Logout</button>
    </div>
  );
};

export default Dashboard;