import SkeletonBlock from './SkeletonBlock';

const SkeletonProfile = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-dark text-white mt-20 rounded-xl shadow-xl space-grotesk">
      {/* Profile Header Skeleton */}
      <div className="flex flex-col items-center mb-6">
        <div className="bg-darkLight w-24 h-24 rounded-full mb-4 shadow-md animate-pulse"></div>
        <SkeletonBlock width="w-32" height="h-5" className="mb-2" />
        <SkeletonBlock width="w-48" height="h-3" className="mb-2" />
        <SkeletonBlock width="w-80" height="h-4" />
      </div>

      {/* Wallets Section Skeleton */}
      <div className="bg-darkLight rounded-xl p-5 mt-8 shadow-md border border-neonLight space-y-4">
        <SkeletonBlock width="w-40" height="h-5" />

        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row md:justify-between"
          >
            <div className="space-y-2">
              <SkeletonBlock width="w-28" height="h-3" />
              <SkeletonBlock width="w-40" height="h-4" />
              <SkeletonBlock width="w-64" height="h-3" />
            </div>
            <SkeletonBlock width="w-20" height="h-8" className="mt-4 md:mt-0 bg-neon" />
          </div>
        ))}
      </div>

      {/* Add Wallet Skeleton */}
      <div className="bg-darkLight rounded-xl p-5 mt-8 shadow-md border border-neonLight space-y-4">
        <SkeletonBlock width="w-40" height="h-5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((_, i) => (
            <SkeletonBlock key={i} height="h-10" />
          ))}
        </div>
        <SkeletonBlock width="w-32" height="h-10" className="bg-neon" />
      </div>
    </div>
  );
};

export default SkeletonProfile;
