import AuthLayout from "../components/AuthLayout";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
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
      login(res.data);
      handleClick();
      navigate("/home");
    } catch (err) {
      handleError();
    }
  };

  const handleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const googleUser = {
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
      };
      const res = await api.post("/auth/google", googleUser);
      localStorage.setItem('token', res.data.token);
      login(res.data);
      handleClick();
      navigate("/home");
    } catch (err) {
      handleError();
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
      <div className="w-full max-w-md mx-auto bg-darkLight p-6 rounded shadow-md">
        <h2 className="text-2xl font-bold text-neon mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            Sign In
          </button>

          <div className="flex justify-center mt-2">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => alert("Google Login Failed")}
              width=""
            />
          </div>
        </form>

        <p className="mt-6 text-sm text-center text-gray-400">
          Don't have an account?{" "}
          <a href="/register" className="text-neon underline">Register</a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
