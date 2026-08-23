import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'
import { Menu, LogOut, Home, MapPin, Users, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state: any) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container flex justify-between items-center py-4">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <AlertCircle className="w-8 h-8" />
          <span className="text-2xl font-bold">TourGuardian</span>
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link to="/dashboard" className="hover:text-blue-200 transition">
            <Home className="w-5 h-5 inline mr-2" />Dashboard
          </Link>
          <Link to="/trip-planner" className="hover:text-blue-200 transition">
            <MapPin className="w-5 h-5 inline mr-2" />Plans
          </Link>
          <Link to="/emergency-contacts" className="hover:text-blue-200 transition">
            <Users className="w-5 h-5 inline mr-2" />Contacts
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 btn-secondary hover:bg-gray-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
