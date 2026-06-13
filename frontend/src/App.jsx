import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatbotWidget from './components/ChatbotWidget';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchBus from './pages/SearchBus';
import BusDetails from './pages/BusDetails';
import SeatSelection from './pages/SeatSelection';
import Payment from './pages/Payment';
import BookingConfirmation from './pages/BookingConfirmation';
import BookingHistory from './pages/BookingHistory';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search-bus" element={<SearchBus />} />
        <Route path="/bus-details/:busId" element={<BusDetails />} />
        <Route path="/seat-selection/:busId" element={<SeatSelection />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <ChatbotWidget /> 
    </BrowserRouter>
  );
}

export default App;
