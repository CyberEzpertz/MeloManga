//sample: http://localhost:3000/chapter/157282a2-d627-45ac-ab3a-8a7769a5945b

'use client';

import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import {Button} from '@/components/ui/button';

export default function GetChapter(){
    const {chapterId} = useParams();
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!chapterId) return;

        const fetchChapterImages = async () => {
            setLoading(true);

            try{
                const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
                const data = await res.json();

                const baseUrl = data.baseUrl;
                const hash = data.chapter.hash;
                const imageUrls = data.chapter.data.map((filename: string) => `${baseUrl}/data/${hash}/${filename}`);

                setImages(imageUrls);
            }

            catch(err){
                console.error('Image fetch FAILED: ', err);
                setImages([]);
            }

            setLoading(false);
        };

        fetchChapterImages();
    }, 
    [chapterId]);

    return( //full disclosure: I used chatGPT to help with this part
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-semibold">
                Chapter: {chapterId}
            </h1>

            {loading && <p>Loading pages...</p>}

            <div className="grid gap-4">
                {images.map((url, i) => (
                <img key={i} src={url} alt={`Page ${i + 1}`} className="w-full" />
                ))}
            </div>

            {!loading && images.length === 0 && <p>No images found.</p>}
        </div>
    );
}