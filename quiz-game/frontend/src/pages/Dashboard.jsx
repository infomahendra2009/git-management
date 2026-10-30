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
    <>
      <div className="nav">
        <strong>Quiz Platform</strong>
        <div className="row" style={{ flex: '0 0 auto' }}>
          <span className="muted">{user.name} <span className="badge">{ROLE_LABEL[user.role]}</span></span>
          <button className="secondary" onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div className="container">
        <div className="tabs" style={{ flexWrap: 'wrap' }}>
          {tabs.map(([k, label]) => <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{label}</button>)}
        </div>

        {tab === 'home' && (
          <div className="card">
            <h2>Welcome, {user.name}</h2>
            <p className="muted">User ID: {user.userCode}</p>
            {user.role === 'STUDENT' && <p>Open <strong>My quizzes</strong> to start or resume a quiz, and <strong>My results</strong> to see your score trend and strengths once results are released.</p>}
            {isStaff && <p>Build questions, group students into classes, create and publish quizzes, then release results. Use <strong>Reports</strong> for student-wise, quiz-wise and class-wise analysis with CSV, Excel and PDF export.</p>}
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
    </>
  );
}
