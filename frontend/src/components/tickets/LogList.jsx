export default function LogList({ logs=[] }) {
  if (!logs.length) return <div className="text-muted">Chưa có tương tác</div>;
  return (
    <ul className="list-group">
      {[...logs].reverse().map((l, i) => (
        <li key={l._id || i} className="list-group-item d-flex justify-content-between">
          <div>
            <span className="badge text-bg-secondary me-2">{l.type || 'note'}</span>
            {l.message}
          </div>
          <small className="text-muted">{new Date(l.createdAt || Date.now()).toLocaleString()}</small>
        </li>
      ))}
    </ul>
  );
}
