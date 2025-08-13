import { useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  useEffect(() => {
    const fetchStats = async () => {
      // Fetch stats for future use - currently not displayed in UI
      await getDocs(collection(db, 'staff'));
      await getDocs(collection(db, 'customers'));
      await getDocs(collection(db, 'services'));
      await getDocs(collection(db, 'services'));
    };
    fetchStats();
  }, []);

  return (
    <div className="p-4 bg-white min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="mb-4">Welcome back, Harry Rollerson</p>
      <div className="flex space-x-4 mb-4">
        <input type="text" placeholder="Manual Appointment Booking" className="flex-grow p-2 border border-gray-300 rounded" />
        <button className="bg-red-500 text-white p-2 rounded">Support Ticket</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="p-4 bg-gray-100 rounded shadow">
          <h2 className="text-lg font-bold flex items-center">
            <span className="mr-2 text-blue-500">%</span>Services Management
          </h2>
          <p className="text-gray-600">Manage your services, pricing, and availability settings.</p>
          <Link to="/services" className="bg-blue-500 text-white p-2 rounded block mt-2">Manage Services</Link>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <h2 className="text-lg font-bold flex items-center">
            <span className="mr-2 text-blue-500">%</span>Staff Management
          </h2>
          <p className="text-gray-600">Manage your team and set working schedules for staff.</p>
          <button className="bg-blue-500 text-white p-2 rounded block mt-2">Manage Staff</button>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <h2 className="text-lg font-bold flex items-center">
            <span className="mr-2 text-blue-500">%</span>Customer Management
          </h2>
          <p className="text-gray-600">Manage your client database and track customer relationships.</p>
          <button className="bg-blue-500 text-white p-2 rounded block mt-2">Manage Customers</button>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <h2 className="text-lg font-bold">Top Services</h2>
          <p className="text-gray-600">View your top-performing services.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-gray-100 rounded shadow">
          <h2 className="text-lg font-bold">Social Media Marketing</h2>
          <p className="text-gray-600">Connect your social media accounts to generate leads and automate bookings from Instagram.</p>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded block mt-2">Connect Instagram</button>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <h2 className="text-lg font-bold">Q Google Ads Analytics</h2>
          <p className="text-gray-600">Connect your Google Ads account to track ad performance, conversions, and optimize your advertising spend.</p>
          <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-2 rounded block mt-2">Connect Google Ads</button>
        </div>
      </div>
      <div className="p-4 bg-gray-100 rounded shadow mb-4">
        <h2 className="text-lg font-bold">My Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-2 bg-white rounded shadow flex justify-between items-center">
            <p>Weekly Bookings</p>
            <p className="text-2xl">0</p>
          </div>
          <div className="p-2 bg-white rounded shadow flex justify-between items-center">
            <p>Monthly Revenue</p>
            <p className="text-2xl">$0</p>
          </div>
          <div className="p-2 bg-white rounded shadow flex justify-between items-center">
            <p>Monthly Reviews</p>
            <p className="text-2xl">0</p>
          </div>
          <div className="p-2 bg-white rounded shadow flex justify-between items-center">
            <p>Total Clients</p>
            <p className="text-2xl">0</p>
          </div>
          <div className="p-2 bg-white rounded shadow flex justify-between items-center">
            <p>At-Risk Clients</p>
            <p className="text-2xl">0</p>
          </div>
          <div className="p-2 bg-white rounded shadow flex justify-between items-center">
            <p>Avg Booking Value</p>
            <p className="text-2xl">$0</p>
          </div>
        </div>
        <button className="bg-blue-500 text-white p-2 rounded block mt-2">View All</button>
      </div>
      <div className="p-4 bg-gray-100 rounded shadow">
        <h2 className="text-lg font-bold">Today's Appointments</h2>
        <p>No appointments today.</p>
      </div>
    </div>
  );
};

export default Dashboard;