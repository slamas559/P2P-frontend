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
  };

  const handleError = () => {
    showNotification({
      type: 'error',
      message: 'Registration failed. Please try again.',
      duration: 3000,
    });
  };

  const onSubmit = async (data) => {
    try {
      await api.post("/auth/register", data);
      handleRegister();
      navigate("/login");
    } catch (err) {
      handleError();
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
      const res = await api.post('/auth/google', googleUser);
      localStorage.setItem('token', res.data.token);
      handleRegister();
      navigate('/login');
    } catch (error) {
      handleError();
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto bg-dark p-6 rounded shadow-md">
        <h2 className="text-2xl font-bold text-neon mb-6 text-center">Register</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <input
              {...register("name")}
              type="text"
              placeholder="Full Name"
              className="w-full bg-dark border border-neonLight text-white px-4 py-2 rounded focus:outline-none focus:border-neon transition"
            />
            <p className="text-red-400 text-sm mt-1">{errors.name?.message}</p>
          </div>

          <div>
            <input
              {...register("email")}
              type="email"
              placeholder="Email"
              className="w-full bg-dark border border-neonLight text-white px-4 py-2 rounded focus:outline-none focus:border-neon transition"
            />
            <p className="text-red-400 text-sm mt-1">{errors.email?.message}</p>
          </div>

          <div>
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="w-full bg-dark border border-neonLight text-white px-4 py-2 rounded focus:outline-none focus:border-neon transition"
            />
            <p className="text-red-400 text-sm mt-1">{errors.password?.message}</p>
          </div>

          <button
            type="submit"
            className="w-full bg-neon text-dark font-bold py-2 rounded hover:bg-neonLight transition"
          >
            Create Account
          </button>

          <div className="flex justify-center mt-2">
            <GoogleLogin
              onSuccess={handleGoogleRegister}
              onError={() => console.log('Google Login Failed')}
              width="1000%"
            />
          </div>
        </form>

        <p className="mt-6 text-sm text-center text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-neon underline">Login</a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
