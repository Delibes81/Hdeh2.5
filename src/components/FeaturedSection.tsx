export default function FeaturedSection() {
  return (
    <section className="w-full bg-stone overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto block"
      >
        <source src="/Video/video-helena.webm" type="video/webm" />
      </video>
    </section>
  );
}
