import Image from "next/image";

export function PageLoadingGif() {
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] w-full items-center justify-center">
      <Image
        src="/gif/water-loading.gif"
        alt="Loading"
        width={460}
        height={460}
        className="h-64 w-64 object-contain sm:h-72 sm:w-72"
        priority
        unoptimized
      />
    </div>
  );
}
