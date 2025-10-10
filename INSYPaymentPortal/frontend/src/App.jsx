// calling in the required imports to handle routing between multiple pages
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// call in our pages
import Home from './pages/Home.jsx'
import BankingLogin from './components/BankingLogin.jsx'
import BankingDashboard from './components/BankingDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import BankingRegistration from './components/BankingRegistration.jsx'

function App() {
  return (
    /* the router is the main thing that handles our routing needs */
    <Router>
      {/* we then specify that we have MULTIPLE routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<BankingLogin/>}/>
        <Route path="/register" element={<BankingRegistration/>}/>
        {/* because dashboard is now wrapped in ProtectedRoute, authentication will be checked in order
        to navigate there */ }
        <Route path="/dashboard" element={
          <ProtectedRoute> 
            <BankingDashboard/> 
          </ProtectedRoute>
        }/>
      </Routes>
    </Router>
  )
}

export default App