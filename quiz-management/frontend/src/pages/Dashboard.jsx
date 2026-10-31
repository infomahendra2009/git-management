import { useState } from 'react';
import Users from './Users.jsx';
import Questions from './Questions.jsx';
import Classes from './Classes.jsx';
import Quizzes from './Quizzes.jsx';
import Reports from './Reports.jsx';
import StudentResults from './StudentResults.jsx';
import StudentQuizzes from './StudentQuizzes.jsx';
import Grading from './Grading.jsx';
import AuditLog from './AuditLog.jsx';
import TakeQuiz from './TakeQuiz.jsx';

const ROLE_LABEL = { ADMIN: 'Admin', TEACHER: 'Teacher', STUDENT: 'Student' };

export default function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState('home');
  const [taking, setTaking] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const isAdmin = user.role === 'ADMIN';
  const isStaff = isAdmin || user.role === 'TEACHER';

  if (taking) return <TakeQuiz attemptId={taking} onExit={() => { setTaking(null); setRefresh((n) => n + 1); setTab('myquizzes'); }} />;

  const tabs = isStaff
    ? [['home', 'Home'], ['quizzes', 'Quizzes'], ['grading', 'Grading'], ['reports', 'Reports'], ['questions', 'Questions'], ['classes', 'Classes'], ['users', isAdmin ? 'Users' : 'Students'], ...(isAdmin ? [['audit', 'Audit log']] : [])]
    : [['home', 'Home'], ['myquizzes', 'My quizzes'], ['results', 'My results']];

  return (
    <div className={isStaff ? 'app-shell staff-shell' : 'app-shell student-shell'}>
      <header className="nav portal-nav">
        <div className="portal-brand">
          <span className="portal-brand-mark">Q</span>
          <span>Quiz<span className="portal-brand-light">Portal</span></span>
        </div>
        <div className="portal-user">
          <span className="portal-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
          <span className="portal-user-copy"><strong>{user.name}</strong><span>{ROLE_LABEL[user.role]} · {user.userCode}</span></span>
          <button className="secondary portal-logout" onClick={onLogout}>Logout</button>
        </div>
      </header>
      <div className="container portal-main">
        <nav className={isStaff ? 'tabs portal-tabs staff-tabs' : 'tabs portal-tabs'} aria-label="Main navigation">
          {tabs.map(([k, label]) => (
            <button key={k} className={tab === k ? 'active' : ''} aria-current={tab === k ? 'page' : undefined} onClick={() => setTab(k)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'home' && (
          isStaff
            ? <div className="card staff-welcome">
              <span className="eyebrow">YOUR WORKSPACE</span>
              <h1>Welcome back, {user.name}</h1>
              <p className="muted">Build great assessments, support your students, and follow their progress from one place.</p>
              <div className="welcome-actions">
                <button onClick={() => setTab('quizzes')}>Manage quizzes</button>
                <button className="secondary" onClick={() => setTab('questions')}>Question bank</button>
              </div>
            </div>
            : <div className="card student-welcome">
              <div>
                <span className="eyebrow">YOUR LEARNING SPACE</span>
                <h1>Ready for a new challenge, {user.name.split(' ')[0]}?</h1>
                <p>Pick up where you left off or explore your assigned quizzes.</p>
                <button onClick={() => setTab('myquizzes')}>Explore my quizzes <span aria-hidden="true">→</span></button>
              </div>
              <div className="welcome-art" aria-hidden="true"><span>Q</span><i>✦</i><b>?</b></div>
            </div>
        )}
        {tab === 'quizzes' && isStaff && <Quizzes user={user} />}
        {tab === 'grading' && isStaff && <Grading />}
        {tab === 'reports' && isStaff && <Reports user={user} />}
        {tab === 'audit' && isAdmin && <AuditLog />}
        {tab === 'questions' && isStaff && <Questions user={user} />}
        {tab === 'classes' && isStaff && <Classes />}
        {tab === 'users' && isStaff && <Users canManage={isAdmin} />}
        {tab === 'results' && !isStaff && <StudentResults />}
        {tab === 'myquizzes' && !isStaff && <StudentQuizzes key={refresh} onTake={setTaking} />}
      </div>
      <footer className="portal-footer">QuizPortal <span>·</span> Learn at your own pace</footer>
    </div>
  );
}
