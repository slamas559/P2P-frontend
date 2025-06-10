// src/components/Tabs.jsx
export default function Tabs({ activeTab, setActiveTab }) {
  const tabs = ["Buy", "Sell"];
  return (
    <div className="flex bg-dark border w-fit rounded-lg p-1 border-neonLight shadow-lg">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`p-3 rounded-lg w-[100px] text-center text-white font-semibold transition-colors ${
            activeTab === tab ? "bg-neon text-dark" : "hover:bg-darkLight"
          }`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
