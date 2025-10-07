import React from "react";
export default function EventTimeline({ events = [] }) {
  if (!events.length) return <div className="text-muted">No events</div>;
  return (
    <ul className="list-group list-group-flush">
      {events.slice().reverse().map((e, i) => (
        <li key={i} className="list-group-item">
          <div className="d-flex justify-content-between">
            <div>
              <b>{e.action}</b>
              {e.note && <div className="small text-muted">{e.note}</div>}
              {e.by?.role && <div className="small text-muted">by {e.by.role} ({e.by.id})</div>}
            </div>
            <small className="text-muted">{new Date(e.at).toLocaleString()}</small>
          </div>
        </li>
      ))}
    </ul>
  );
}
