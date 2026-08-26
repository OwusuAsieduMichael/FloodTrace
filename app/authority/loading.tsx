import { Skeleton } from "@/components/ui/skeleton";

export default function AuthorityLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-border/60 pb-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-5">
        <Skeleton className="h-72 rounded-xl xl:col-span-2" />
        <Skeleton className="h-72 rounded-xl xl:col-span-3" />
      </div>
    </div>
  );
}
