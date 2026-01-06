import {useAuth} from '../context/AuthContext'
import { useNavigate } from 'react-router-dom';

// hooks for logout in different pages
export const useLogout = () => {
  const navigate = useNavigate();
  const {user, logout} = useAuth();

  const handleLogout = async ():Promise<void> => {
    if (user){
      try {
        await logout();
        navigate("/login");
      } catch (error){
        throw new Error(`${error}, something wrong with useLogout hook`);
      }
    }
  };
  return handleLogout;
}