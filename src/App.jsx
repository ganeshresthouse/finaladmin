import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import Banners from './pages/Banners';
import AdminLayout from './components/AdminLayout';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/banners" element={<Banners />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
