// src/components/AuthLayout.jsx
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center font-sans">
      <div className=" backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-sm border-neon">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
