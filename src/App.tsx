import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerManagement from './CustomerManagement';
import StaffManagement from './StaffManagement';
import ManualBooking from './ManualBooking';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerManagement />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/booking" element={<ManualBooking />} />
      </Routes>
    </Router>
  );
};

export default App;