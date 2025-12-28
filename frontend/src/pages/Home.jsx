import { useContext, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../services/AuthContext';

export default function Home() {
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      route('/login');
    } else if (!loading && user) {
      // Route based on user role
      if (user.role === 'admin') {
        route('/admin');
      } else if (user.role === 'merchant') {
        route('/merchant');
      } else if (user.role === 'rider') {
        route('/rider');
      } else {
        route('/products');
      }
    }
  }, [user, loading]);

  return (
    <div class="page home-page">
      <div class="container">
        <h1>Welcome to AbachaOnline</h1>
        <p>Your campus marketplace & delivery platform</p>
        {loading && <div class="loading">Loading...</div>}
      </div>
    </div>
  );
}
