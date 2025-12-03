import { Navigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function ProtectedRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/auth/me`, { withCredentials: true })
      .then(() => setAllowed(true))
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === null) return <div>Checking session…</div>;
  if (allowed === false) return <Navigate to="/login" replace />;

  return children;
}
