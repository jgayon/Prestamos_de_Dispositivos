import React from 'react';
import Layout from '../components/Layout';
import LoanForm from '../components/LoanForm';

const LoanFormPage: React.FC = () => {
  return (
    <Layout>
      <h2>Nuevo Préstamo</h2>
      <LoanForm />
    </Layout>
  );
};

export default LoanFormPage;
