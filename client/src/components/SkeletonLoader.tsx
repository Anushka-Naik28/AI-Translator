// Skeleton Loader component for translation waiting state

export default function SkeletonLoader() {
  return (
    <div className="w-full space-y-3.5 animate-pulse py-2">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2"></div>
    </div>
  );
}
