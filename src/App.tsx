import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple test component
const TestComponent = () => (
  <div className="p-8 bg-white min-h-screen text-black">
    <h1 className="text-3xl font-bold text-blue-600 mb-4">HR Stores LLC - Booking System</h1>
    <p className="text-lg mb-4">Welcome to your booking management system!</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-blue-100 rounded shadow">
        <h2 className="text-xl font-bold text-blue-800">Customer Management</h2>
        <p className="text-blue-600">Manage your customer database</p>
      </div>
      <div className="p-4 bg-green-100 rounded shadow">
        <h2 className="text-xl font-bold text-green-800">Staff Management</h2>
        <p className="text-green-600">Manage your team members</p>
      </div>
      <div className="p-4 bg-purple-100 rounded shadow">
        <h2 className="text-xl font-bold text-purple-800">Manual Booking</h2>
        <p className="text-purple-600">Create manual appointments</p>
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestComponent />} />
        <Route path="/staff" element={<TestComponent />} />
        <Route path="/booking" element={<TestComponent />} />
      </Routes>
    </Router>
  );
};

export default App;