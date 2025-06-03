// src/components/Register.jsx
import AuthLayout from "../components/AuthLayout";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNotification } from '../context/NotificationContext';



const schema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

const Register = () => {

const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleRegister = () => {
    showNotification({
      type: 'success',
      message: 'Registration successful! Please login.',
      duration: 3000,
    });
  }
  const handleError = () => {
    showNotification({
      type: 'error',
      message: 'Registration failed. Please try again.',
      duration: 3000,
    });
  }

  const onSubmit = async (data) => {
    try {
      await api.post("/auth/register", data);
      handleRegister(); // Show success notification
      navigate("/login");
    } catch (err) {
      handleError(); // Show error notification
    }
  };

  const handleGoogleRegister = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      const googleUser = {
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
      };

      // Send this info to your backend
      const res = await api.post('/auth/google', googleUser);

      // Save auth token and user info in localStorage or context
      localStorage.setItem('token', res.data.token);
      // You can also update your auth context here
      handleRegister(); // Show success notification
      navigate('/login'); // redirect after login/register
    } catch (error) {
      handleError(); // Show error notification
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-neon mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input {...register("name")}
          type="text"
          placeholder="Full Name"
          className="bg-dark border border-neonLight text-white px-4 py-2 rounded focus:outline-none focus:border-neon transition"
        />
        <p className="text-red-400 text-sm">{errors.name?.message}</p>
        
        <input {...register("email")}
          type="email"
          placeholder="Email"
          className="bg-dark border border-neonLight text-white px-4 py-2 rounded focus:outline-none focus:border-neon transition"
        />
        <input {...register("password")}
          type="password"
          placeholder="Password"
          className="bg-dark border border-neonLight text-white px-4 py-2 rounded focus:outline-none focus:border-neon transition"
        />
        <button
          type="submit"
          className="bg-neon text-dark font-bold py-2 rounded hover:bg-neonLight transition"
        >
          Create Account
        </button>
        <div className="text-center">
        <GoogleLogin
          onSuccess={handleGoogleRegister}
          onError={() => console.log('Login Failed')}
        />
        </div>
      </form>
      <p className="mt-4 text-sm text-center text-gray-400">
        Already have an account? <a href="/login" className="text-neon underline">Login</a>
      </p>
    </AuthLayout>
  );
};

export default Register;
