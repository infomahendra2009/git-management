import { useEffect, useState } from 'react';
import { api } from '../api.js';
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
import ChangePassword from './ChangePassword.jsx';
import SolarSystemModule, { SolarSystemAssignments } from './SolarSystemModule.jsx';

const ROLE_LABEL = { ADMIN: 'Admin', TEACHER: 'Teacher', STUDENT: 'Student' };

export default function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState('home');
  const [taking, setTaking] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [solarSystemAssigned, setSolarSystemAssigned] = useState(false);
  const [solarAccessError, setSolarAccessError] = useState('');
  const isAdmin = user.role === 'ADMIN';
  const isStaff = isAdmin || user.role === 'TEACHER';

  useEffect(() => {
    if (isStaff) return;
    api('/learning-module/access')
      .then((result) => setSolarSystemAssigned(result.assigned))
      .catch((error) => setSolarAccessError(error.message));
  }, [isStaff]);

  if (taking) return <TakeQuiz attemptId={taking} onExit={() => { setTaking(null); setRefresh((n) => n + 1); setTab('myquizzes'); }} />;

  const tabs = isStaff
    ? [['home', 'Home'], ['quizzes', 'Quizzes'], ['grading', 'Grading'], ['reports', 'Reports'], ['questions', 'Questions'], ['classes', 'Classes'], ['users', isAdmin ? 'Users' : 'Students'], ...(isAdmin ? [['solar-module', 'Solar System'], ['india-map', 'India map'], ['audit', 'Audit log']] : [])]
    : [['home', 'Home'], ['myquizzes', 'My quizzes'], ['results', 'My results'], ...(solarSystemAssigned ? [['solar-learning', 'Learning module'], ['india-map', 'India map']] : [])];

  return (
    <div className={isStaff ? 'app-shell staff-shell' : 'app-shell student-shell'}>
      <header className="nav portal-nav">
        <button
          type="button"
          className="portal-brand portal-brand-home"
          aria-label="Go to dashboard home"
          onClick={() => { setTab('home'); setChangingPassword(false); }}
        >
          <span className="portal-brand-mark">Q</span>
          <span>Quiz<span className="portal-brand-light">Portal</span></span>
        </button>
        <div className="portal-user">
          <span className="portal-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
          <span className="portal-user-copy"><strong>{user.name}</strong><span>{ROLE_LABEL[user.role]} · {user.userCode}</span></span>
          <button className="secondary portal-password" onClick={() => setChangingPassword(true)}>Password</button>
          <button className="secondary portal-logout" onClick={onLogout}>Logout</button>
        </div>
      </header>
      <div className="container portal-main">
        <nav className={isStaff ? 'tabs portal-tabs staff-tabs' : 'tabs portal-tabs'} aria-label="Main navigation">
          {tabs.map(([k, label]) => (
            <button key={k} className={tab === k ? 'active' : ''} aria-current={tab === k ? 'page' : undefined} onClick={() => { setTab(k); setChangingPassword(false); }}>
              {label}
            </button>
          ))}
        </nav>

        {changingPassword && <ChangePassword onDone={() => setChangingPassword(false)} />}
        {!isStaff && solarAccessError && <div className="card err" role="alert">Could not check your learning modules: {solarAccessError}</div>}
        {!changingPassword && tab === 'home' && (
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
        {!changingPassword && tab === 'quizzes' && isStaff && <Quizzes user={user} />}
        {!changingPassword && tab === 'grading' && isStaff && <Grading />}
        {!changingPassword && tab === 'reports' && isStaff && <Reports user={user} />}
        {!changingPassword && tab === 'audit' && isAdmin && <AuditLog />}
        {!changingPassword && tab === 'solar-module' && isAdmin && <SolarSystemAssignments />}
        {!changingPassword && tab === 'solar-learning' && !isStaff && solarSystemAssigned && <SolarSystemModule />}
        {!changingPassword && tab === 'india-map' && (isAdmin || (!isStaff && solarSystemAssigned)) && <SolarSystemModule initialPage={4} />}
        {!changingPassword && tab === 'questions' && isStaff && <Questions user={user} />}
        {!changingPassword && tab === 'classes' && isStaff && <Classes />}
        {!changingPassword && tab === 'users' && isStaff && <Users canManage={isAdmin} />}
        {!changingPassword && tab === 'results' && !isStaff && <StudentResults />}
        {!changingPassword && tab === 'myquizzes' && !isStaff && <StudentQuizzes key={refresh} onTake={setTaking} />}
      </div>
      <footer className="portal-footer">QuizPortal <span>·</span> Learn at your own pace</footer>
    </div>
  );
}
