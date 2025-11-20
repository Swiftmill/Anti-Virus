import { useEffect, useState } from 'react';
import type { QuarantineItem, User } from '../types/models';

const QuarantinePage = ({ user }: { user: User }) => {
  const [items, setItems] = useState<QuarantineItem[]>([]);

  const loadItems = async () => {
    const data = await window.electronAPI.listQuarantine();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const restore = async (id: string) => {
    await window.electronAPI.restoreFile(id);
    loadItems();
  };

  const remove = async (id: string) => {
    if (confirm('Delete permanently?')) {
      await window.electronAPI.deleteQuarantine(id);
      loadItems();
    }
  };

  return (
    <div className="card glass">
      <h2>Quarantine vault</h2>
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Original path</th>
            <th>Reason</th>
            <th>Severity</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.fileName}</td>
              <td>{item.originalPath}</td>
              <td>{item.reason}</td>
              <td>{item.severity}</td>
              <td>{new Date(item.addedAt).toLocaleString()}</td>
              <td>
                <button onClick={() => restore(item.id)}>Restore</button>
                <button onClick={() => remove(item.id)} className="danger">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuarantinePage;
