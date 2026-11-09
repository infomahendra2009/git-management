import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { sharedPages } from '../share-page/registry.js';

const emptyAssignment = () => ({ classIds: new Set(), studentIds: new Set() });

export default function SharedPageAssignments() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [selectedPageId, setSelectedPageId] = useState(sharedPages[0]?.id || '');
  const [section, setSection] = useState('classes');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    Promise.all([api('/classes'), api('/users?role=STUDENT'), api('/shared-pages/assignments')])
      .then(([classData, userData, assignmentData]) => {
        setClasses(classData.classes);
        setStudents(userData.users.filter((student) => student.isActive));
        setAssignments(Object.fromEntries(assignmentData.assignments.map((item) => [
          item.pageId,
          { classIds: new Set(item.classIds), studentIds: new Set(item.studentIds) },
        ])));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const current = assignments[selectedPageId] || emptyAssignment();
  const selectedPage = sharedPages.find((page) => page.id === selectedPageId);
  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((student) => !term || [student.name, student.email, student.userCode].some((value) => value.toLowerCase().includes(term)));
  }, [search, students]);

  const toggle = (field, id) => {
    setAssignments((previous) => {
      const next = { ...emptyAssignment(), ...(previous[selectedPageId] || {}) };
      next[field] = new Set(next[field]);
      if (next[field].has(id)) next[field].delete(id);
      else next[field].add(id);
      return { ...previous, [selectedPageId]: next };
    });
    setNotice('');
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await api(`/shared-pages/${selectedPageId}/assignments`, {
        method: 'PUT',
        body: { classIds: [...current.classIds], studentIds: [...current.studentIds] },
      });
      setNotice(`Page assigned to ${result.classes} class(es) and ${result.students} student account(s).`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card portal-loading">Loading shared pages…</div>;

  return (
    <section className="solar-admin">
      <div className="card solar-admin-hero">
        <span className="eyebrow">ADMIN · SHARED PAGES</span>
        <h1>Shared learning pages</h1>
        <p>Pages in <code>frontend/src/share-page</code> are discovered automatically. Assign each page to classes or individual students.</p>
      </div>
      {sharedPages.length === 0
        ? <div className="card"><p className="muted">No shared pages found. Add a React page to <code>frontend/src/share-page</code>.</p></div>
        : <div className="card">
          <label htmlFor="shared-page-select">Page</label>
          <select id="shared-page-select" value={selectedPageId} onChange={(event) => { setSelectedPageId(event.target.value); setNotice(''); }}>
            {sharedPages.map((page) => <option key={page.id} value={page.id}>{page.title}</option>)}
          </select>
          {selectedPage?.description && <p className="muted">{selectedPage.description}</p>}
          <div className="solar-assignment-card">
            <div className="subtabs solar-assignment-tabs" role="group" aria-label="Assignment targets">
              <button type="button" aria-pressed={section === 'classes'} className={section === 'classes' ? 'active' : ''} onClick={() => setSection('classes')}>
                Assign to classes <span>{current.classIds.size}</span>
              </button>
              <button type="button" aria-pressed={section === 'students'} className={section === 'students' ? 'active' : ''} onClick={() => setSection('students')}>
                Assign to students <span>{current.studentIds.size}</span>
              </button>
            </div>
            {section === 'classes'
              ? <div className="solar-target-list">
                {classes.map((item) => (
                  <label className="solar-target" key={item.id}>
                    <input type="checkbox" checked={current.classIds.has(item.id)} onChange={() => toggle('classIds', item.id)} />
                    <span className="solar-target-icon">▦</span>
                    <span><strong>{item.name}</strong><small>{item.members} students · {item.owner}</small></span>
                  </label>
                ))}
                {classes.length === 0 && <p className="muted">No classes yet. Create a class from the Classes tab first.</p>}
              </div>
              : <>
                <label className="solar-search-label" htmlFor="shared-student-search">Find a student</label>
                <input id="shared-student-search" className="solar-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or student ID" />
                <div className="solar-target-list solar-student-list">
                  {visibleStudents.map((student) => (
                    <label className="solar-target" key={student.id}>
                      <input type="checkbox" checked={current.studentIds.has(student.id)} onChange={() => toggle('studentIds', student.id)} />
                      <span className="solar-target-avatar">{student.name.slice(0, 1).toUpperCase()}</span>
                      <span><strong>{student.name}</strong><small>{student.userCode} · {student.email}</small></span>
                    </label>
                  ))}
                  {visibleStudents.length === 0 && <p className="muted">No active students match your search.</p>}
                </div>
              </>}
            {error && <div className="err" role="alert">{error}</div>}
            {notice && <div className="ok" role="status">{notice}</div>}
            <div className="solar-assignment-actions">
              <span className="muted">Save replaces this page’s current assignment list.</span>
              <button type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save assignments'}</button>
            </div>
          </div>
        </div>}
    </section>
  );
}
