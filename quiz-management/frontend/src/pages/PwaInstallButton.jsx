import { useEffect, useState } from 'react';

export default function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onInstalled = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!installPrompt) return null;

  const install = async () => {
    setError('');
    try {
      await installPrompt.prompt();
      setInstallPrompt(null);
    } catch (e) {
      setError(e.message || 'The app could not be installed. Try your browser menu.');
    }
  };

  return (
    <div className="pwa-install-control">
      {error && <span role="status">{error}</span>}
      <button className="install-app-button" onClick={install}>Install QuizPortal</button>
    </div>
  );
}
