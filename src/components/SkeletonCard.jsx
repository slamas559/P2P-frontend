import SkeletonBlock from "./SkeletonBlock";

const SkeletonCard = () => {
  return (
    <div className="flex justify-between items-center bg-darkLight border border-neon p-4 rounded-xl m-2 shadow-md animate-pulse">
      <div className="flex-1 space-y-2 pr-4">
        <SkeletonBlock width="w-24" height="h-5" className="orbitron" />
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-full bg-dark border-2 border-neonLight"></div>
          <SkeletonBlock width="w-28" height="h-4" />
        </div>
        <SkeletonBlock width="w-40" height="h-3" />
        <SkeletonBlock width="w-32" height="h-6" />
        <SkeletonBlock width="w-36" height="h-4" />
        <SkeletonBlock width="w-48" height="h-3" />
      </div>
      <div className="flex flex-col justify-between">
        <SkeletonBlock width="w-16" height="h-10" className="bg-neon rounded" />
      </div>
    </div>
  );
};

export default SkeletonCard;
