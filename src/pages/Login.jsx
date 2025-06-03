// src/components/Login.jsx
import AuthLayout from "../components/AuthLayout";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";  // <-- Correct import syntax
import { useNotification } from '../context/NotificationContext';


const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const { login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/login", data);
      login(res.data); // Save token to context
      handleClick(); // Show success notification
      navigate("/home");
    } catch (err) {
      handleError(); // Show error notification}
  };
  }

  // This function handles Google login success
  const handleSuccess = async (credentialResponse) => {
    try {
      // Decode the JWT token received from Google
      const decoded = jwtDecode(credentialResponse.credential);

      const googleUser = {
      name: decoded.name,
      email: decoded.email,
      googleId: decoded.sub,
      };
      // Send the Google token to your backend to login/register the user
      const res = await api.post("/auth/google", googleUser);
      localStorage.setItem('token', res.data.token);

      // Save your backend JWT token in context/state
      login(res.data);
      handleClick(); // Show success notification
      // Redirect to home page after successful login
      navigate("/home");
    } catch (err) {
      handleError(); // Show error notification
    }
  };



  const handleClick = () => {
    showNotification({ type: 'success', message: 'Logged in successfully!' });
  };

  const handleError = () => {
    showNotification({ type: 'error', message: 'Login failed. Please try again.' });
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-neon mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input {...register("email")}
          type="email"
          placeholder="Email"
          className="bg-dark border border-neonLight text-white px-4 py-2 rounded focus:outline-none focus:border-neon transition input"
        />
        <p className="text-red-400 text-sm">{errors.email?.message}</p>

        <input {...register("password")}
          type="password"
          placeholder="Password"
          className="bg-dark border border-neonLight text-white px-4 py-2 rounded focus:outline-none focus:border-neon transition input"
        />
        <p className="text-red-400 text-sm">{errors.password?.message}</p>

        <button
          type="submit"
          className="bg-neon text-dark font-bold py-2 rounded hover:bg-neonLight transition"
        >
          Sign In
        </button>

        {/* Google Login button */}
        <GoogleLogin className="bg-neon text-dark font-bold py-2 rounded hover:bg-neonLight transition"
          onSuccess={handleSuccess}
          onError={() => alert("Google Login Failed")}
        />
      </form>
      <p className="mt-4 text-sm text-center text-gray-400">
        Don't have an account? <a href="/register" className="text-neon underline">Register</a>
      </p>
    </AuthLayout>
  );
};

export default Login;
