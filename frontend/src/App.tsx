import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// fixed imports to match actual filenames
import Login from "./pages/LoginPages";
import Dashboard from "./pages/DashboardPage";
import LoansList from "./pages/LoansPage";
import LoanForm from "./pages/LoanForm";
import LoanDetail from "./pages/LoanDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/loans" element={<LoansList />} />
        <Route path="/loans/new" element={<LoanForm />} />
        <Route path="/loans/:id" element={<LoanDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;