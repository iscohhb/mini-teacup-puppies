'use client';

import { useState } from 'react';

interface Props {
  name: string;
  breed: string;
  images: string[];
  videos?: string[];
}

/** Product-page gallery: large main photo, clickable thumbnails, and videos below. */
export default function DogGallery({ name, breed, images, videos = [] }: Props) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-sand/30 shadow-lift ring-1 ring-black/5">
        {main && (
          <img
            src={main}
            alt={`${name}, ${breed} puppy, photo ${active + 1} of ${images.length}`}
            className="h-full w-full object-contain"
            fetchPriority="high"
          />
        )}
      </div>

      {images.length > 1 && (
        <ul className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5" aria-label={`More photos of ${name}`}>
          {images.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1} of ${name}`}
                aria-current={i === active}
                className={`block aspect-square w-full overflow-hidden rounded-xl bg-sand/30 ring-2 transition ${
                  i === active ? 'ring-ember' : 'ring-transparent hover:ring-forest-200'
                }`}
              >
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {videos.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-extrabold text-forest-800">Videos of {name}</h2>
          {videos.map((src, i) => (
            <video key={`${src}-${i}`} src={src} controls preload="metadata" playsInline className="w-full rounded-2xl bg-black">
              Your browser does not support video playback.
            </video>
          ))}
        </div>
      )}
    </div>
  );
}
