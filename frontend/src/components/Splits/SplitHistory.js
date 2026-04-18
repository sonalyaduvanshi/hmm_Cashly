
import React, { useEffect, useState } from 'react';
import splitService from '../../services/splitService';

const SplitHistory = () => {
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSplits = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await splitService.getSplits();
        setSplits(data);
      } catch (err) {
        setError('Failed to load split history');
      } finally {
        setLoading(false);
      }
    };
    fetchSplits();
  }, []);

  if (loading) return <div>Loading split history...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="split-history-container">
      <h3>Split History</h3>
      {splits.length === 0 ? (
        <div>No splits found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Participants</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {splits.map((split) => (
              <tr key={split._id}>
                <td>{new Date(split.date).toLocaleDateString()}</td>
                <td>{split.description}</td>
                <td>{split.amount}</td>
                <td>{split.participants?.map(p => p.name).join(', ')}</td>
                <td>{split.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SplitHistory;