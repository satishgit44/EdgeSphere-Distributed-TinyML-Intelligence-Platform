import { UserPlus } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Administrator' | 'Engineer' | 'Viewer';
  status: 'Active' | 'Invited';
}

const MEMBERS: Member[] = [
  { id: '1', name: 'Alex Carter', email: 'alex.carter@edgesphere.local', role: 'Owner', status: 'Active' },
  { id: '2', name: 'Devon Vance', email: 'devon.v@edgesphere.local', role: 'Engineer', status: 'Active' },
  { id: '3', name: 'Sarah Nolan', email: 'sarah.n@edgesphere.local', role: 'Viewer', status: 'Active' },
];

export function TeamPage() {
  return (
    <div className="es-page-container">
      <div className="es-nexus-page-header">
        <div>
          <div className="es-nexus-breadcrumbs">
            <span>Home</span>
            <span className="es-nexus-breadcrumb-sep">&gt;</span>
            <span className="es-nexus-breadcrumb-current">Team & Access</span>
          </div>
          <h1 className="es-nexus-title">Team Access & Workspace RBAC</h1>
          <p className="es-nexus-subtitle">
            Manage local operator accounts and role permissions (Owner, Administrator, Engineer, Viewer).
          </p>
        </div>

        <button
          type="button"
          className="es-nexus-action-button-primary"
          onClick={() => alert('Invite member modal: Provisions local edge access credentials.')}
        >
          <UserPlus size={14} /> Invite Member
        </button>
      </div>

      <article className="es-nexus-card">
        <div className="es-nexus-card-header">
          <div>
            <h3 className="es-nexus-card-title">Authorized Members ({MEMBERS.length})</h3>
            <p className="es-nexus-card-subtitle">Role permissions enforced locally on Raspberry Pi 5</p>
          </div>
        </div>

        <div className="es-nexus-table-wrapper">
          <table className="es-nexus-table">
            <thead>
              <tr>
                <th>MEMBER</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>PERMISSIONS</th>
              </tr>
            </thead>
            <tbody>
              {MEMBERS.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="es-nexus-table-user">
                      <div className="es-nexus-table-avatar">
                        {m.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="es-nexus-table-username">{m.name}</span>
                    </div>
                  </td>
                  <td className="es-nexus-table-plan">{m.email}</td>
                  <td>
                    <span className="es-nexus-mini-badge" style={{ background: '#EDE9FE', color: '#7455F5' }}>
                      {m.role}
                    </span>
                  </td>
                  <td>
                    <span className="es-nexus-status-pill es-nexus-status--active">{m.status}</span>
                  </td>
                  <td style={{ fontSize: '11.5px', color: '#8F90A6' }}>
                    {m.role === 'Owner' && 'Full Workspace & Billing Control'}
                    {m.role === 'Administrator' && 'Device & Model Management'}
                    {m.role === 'Engineer' && 'Telemetry Diagnostics & Model Deploy'}
                    {m.role === 'Viewer' && 'Read-Only Dashboards & Telemetry'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
