import { useState, useCallback, useEffect } from 'react';
import { getLoans, getLoan, createLoan, changeLoanState } from '../api/loans.api';
import { Loan, CreateLoanDTO, LoanStatus } from '../types/Loan';

export const useLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLoans(query);
      setLoans(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching loans');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLoan = useCallback(async (id: string): Promise<Loan | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLoan(id);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching loan');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateLoanDTO): Promise<Loan | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await createLoan(data);
      await fetchLoans();
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error creating loan';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchLoans]);

  const approve = useCallback(async (id: string): Promise<Loan | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await changeLoanState(id, 'approve');
      await fetchLoans();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error approving loan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchLoans]);

  const deliver = useCallback(async (id: string): Promise<Loan | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await changeLoanState(id, 'deliver');
      await fetchLoans();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error delivering loan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchLoans]);

  const returnLoan = useCallback(async (id: string): Promise<Loan | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await changeLoanState(id, 'return');
      await fetchLoans();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error returning loan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchLoans]);

  const expire = useCallback(async (id: string): Promise<Loan | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await changeLoanState(id, 'expire');
      await fetchLoans();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error expiring loan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchLoans]);

  return {
    loans,
    loading,
    error,
    fetchLoans,
    fetchLoan,
    create,
    approve,
    deliver,
    returnLoan,
    expire,
  };
};
