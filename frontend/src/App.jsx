import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NewTicket from './pages/NewTicket.jsx'
import TicketDetail from './pages/TicketDetail.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"              element={<Dashboard />} />
        <Route path="/tickets/new"   element={<NewTicket />} />
        <Route path="/tickets/:id"   element={<TicketDetail />} />
      </Routes>
    </Layout>
  )
}
