import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// fixed imports to match actual filenames
import Login from "./pages/LoginPages";
import Dashboard from "./pages/DashboardPage";
import LoansList from "./pages/LoansPage";
import LoanForm from "./pages/LoanForm";
import LoanDetail from "./pages/LoanDetailPage";
import DevicesPage from "./pages/DevicesPage";
import UsersPage from "./pages/UsersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/loans" element={<LoansList />} />
        <Route path="/loans/new" element={<LoanForm />} />
        <Route path="/loans/:id" element={<LoanDetail />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;