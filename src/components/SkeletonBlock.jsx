const SkeletonBlock = ({ width = "w-full", height = "h-4", rounded = "rounded", className = "" }) => {
  return (
    <div
      className={`bg-darkLight ${width} ${height} ${rounded} animate-pulse ${className}`}
    ></div>
  );
};

export default SkeletonBlock;
