import styles from '@/styles/Home.module.css'
import Link from 'next/link';



export default function Home() {

  return (
    <>
      <main>
        <div className="container">
          <div className="inline-container">
            <figure>
              <Link href="imagePage">
                <img
                  src="images/image.png"
                  className="img-caller rounded"
                  alt="Responsive image"
                />
                <figcaption style={{ marginLeft: 240 }}>Images</figcaption>
              </Link>
            </figure>
            <figure>
              <Link href="chatIndex">
                <img
                  src="images/image.png"
                  className="img-caller rounded"
                  alt="Responsive image"
                />
                <figcaption style={{ marginLeft: 240 }}>Chat</figcaption>
              </Link>
            </figure>
            
          </div>
        </div>
      </main>
    </>
  );
}
