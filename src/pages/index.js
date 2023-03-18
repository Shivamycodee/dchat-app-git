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
                <figcaption style={{ marginLeft: 240 }}>IMAGES</figcaption>
              </Link>
            </figure>
            <figure>
              <Link href="chatIndex">
                <img
                  src="images/image.png"
                  className="img-caller rounded"
                  alt="Responsive image"
                />
                <figcaption style={{ marginLeft: 240 }}>CHAT</figcaption>
              </Link>
            </figure>
            <figure>
              <Link href="upLivepeer">
                <img
                  src="images/image.png"
                  className="img-caller rounded"
                  alt="Responsive image"
                />
                <figcaption style={{ marginLeft: 170 }}>UPLOAD ON LIVEPEER</figcaption>
              </Link>
            </figure>
            <figure>
              <Link href="streamming">
                <img
                  src="images/image.png"
                  className="img-caller rounded"
                  alt="Responsive image"
                />
                <figcaption style={{ marginLeft: 230 }}>LIVE STREAM</figcaption>
              </Link>
            </figure>
          </div>
        </div>
      </main>
    </>
  );
}
