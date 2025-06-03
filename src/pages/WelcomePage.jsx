// pages/WelcomePage.jsx
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaBolt, FaUsers, FaHandshake } from "react-icons/fa";
import screenshot from "../assets/screenshot.png"; // Adjust the path as necessary

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white flex flex-col items-center px-4 pt-16">
    <section className="text-center max-w-3xl mt-20">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 orbitron text-neon">
        Welcome to CryptoConnect
      </h1>
      <p className="text-lg text-gray-300 mb-8">
        Buy and sell crypto securely with verified dealers. Real-time chat, admin-controlled trades, and a sleek experience designed for trust and speed.
      </p>
      <button
        onClick={() => navigate("/login")}
        className="px-6 py-3 rounded-full bg-neon text-[#0d0d0d] space-grotesk font-semibold hover:scale-105 transition-transform"
      >
        Get Started
      </button>

      {/* Optional glow animation */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-[-1]">
        <div className="w-[600px] h-[600px] bg-neonLight rounded-full blur-3xl animate-pulse-slow absolute -top-48 -left-48" />
      </div>
    </section>

      <section className="my-12 w-full max-w-4xl rounded-xl overflow-hidden border border-neonLight shadow-lg">
        <img
          src={screenshot} // replace with your actual image path
          alt="App Screenshot"
          className="w-full object-cover"
        />
      </section>

      {/* Features Section */}
      <section className="text-center my-10">
        <h2 className="text-3xl orbitron text-neon mb-8">Why Choose CryptoConnect?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <FeatureCard
            icon={<FaShieldAlt className="text-3xl text-neon" />}
            title="Secure Trading"
            description="All transactions are protected with encryption and dealer verification."
          />
          <FeatureCard
            icon={<FaBolt className="text-3xl text-neon" />}
            title="Real-Time Chat"
            description="Chat instantly with verified dealers before making trades."
          />
          <FeatureCard
            icon={<FaUsers className="text-3xl text-neon" />}
            title="Active Community"
            description="Join 100+ trusted traders already using CryptoConnect."
          />
          <FeatureCard
            icon={<FaHandshake className="text-3xl text-neon" />}
            title="Dealer-Backed Security"
            description="Every trade is initiated and confirmed by verified human dealers."
          />
        </div>
      </section>

      {/* Social Proof */}
      <section className="my-16 text-center">
        <p className="text-gray-400 text-lg">
          🔒 Trusted by <span className="text-neon font-bold">100+</span> active traders across Nigeria.
        </p>
      </section>
    </div>
  );
};

// FeatureCard Component
    const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-darkLight p-6 rounded-xl border border-neon shadow-lg text-left">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold orbitron text-neon mb-2">{title}</h3>
        <p className="text-gray-300">{description}</p>

    </div>

  );


export default WelcomePage;
