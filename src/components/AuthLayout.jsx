// src/components/AuthLayout.jsx
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center font-sans">
      <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-sm border border-neon">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
