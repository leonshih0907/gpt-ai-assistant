const teamMembers = [
  {
    name: 'Alexandra Reid',
    title: 'Creative Director',
    bio: 'Alexandra shapes elevated concepts that blend timeless elegance with modern functionality for high-end residences.',
    image: '/images/alexandra-reid.jpg',
  },
  {
    name: 'Jessica Morgan',
    title: 'Senior Interior Designer',
    bio: 'Jessica specializes in layered materials, bespoke finishes, and spatial harmony tailored to each client lifestyle.',
    image: '/images/jessica-morgan.jpg',
  },
  {
    name: 'Michael Turner',
    title: 'Project Design Lead',
    bio: 'Michael leads end-to-end project execution with precision, ensuring each detail reflects the studio’s luxury standard.',
    image: '/images/michael-turner.jpg',
  },
  {
    name: 'Priya Khan',
    title: 'Lighting & Styling Expert',
    bio: 'Priya curates refined lighting plans and signature styling moments that bring warmth, depth, and atmosphere.',
    image: '/images/priya-khan.jpg',
  },
  {
    name: 'Lauren Wilson',
    title: 'Materials Specialist',
    bio: 'Lauren sources premium textures and artisan-crafted elements to deliver rich, cohesive, and enduring interiors.',
    image: '/images/lauren-wilson.jpg',
  },
  {
    name: 'Daniel Brooks',
    title: 'Client Experience Manager',
    bio: 'Daniel guides clients through a seamless design journey, balancing practical needs with sophisticated design goals.',
    image: '/images/daniel-brooks.jpg',
  },
]

function App() {
  return (
    <div className="bg-charcoal text-white min-h-screen">
      <header
        id="home"
        className="relative min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/images/team-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60" />

        <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <p className="font-display text-lg tracking-[0.2em] text-beige">ATELIER NOIR</p>
          <ul className="hidden items-center gap-6 text-sm font-medium tracking-wide lg:flex">
            {['HOME', 'ABOUT', 'SERVICES', 'PROJECTS', 'TEAM', 'CONTACT'].map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase()}`} className="text-white/90 transition hover:text-gold">
                  {item}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                className="rounded-full border border-gold bg-gold/15 px-5 py-2 text-gold transition hover:bg-gold hover:text-charcoal"
              >
                BOOK A CONSULTATION
              </a>
            </li>
          </ul>
        </nav>

        <div className="relative z-10 mx-auto flex min-h-[78vh] w-full max-w-7xl items-center px-6 pb-40 pt-16 lg:px-10">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl leading-tight text-beige md:text-6xl">
              Designing Spaces.
              <br />
              Inspiring Lives.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-zinc-200 md:text-xl">
              We are a passionate team of interior designers creating functional, beautiful, and timeless spaces.
            </p>
          </div>
        </div>
      </header>

      <main id="team" className="relative z-20 -mt-28 px-6 pb-20 lg:px-10">
        <section className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-zinc-900/95 p-8 shadow-luxe backdrop-blur md:p-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-gold">Our Designers</p>
              <h2 className="mt-2 font-display text-3xl text-beige md:text-4xl">Meet Our Team</h2>
            </div>
            <a href="#contact" className="text-sm font-semibold text-gold transition hover:text-beige">
              Start Your Project →
            </a>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 transition duration-300 hover:-translate-y-1 hover:shadow-luxe"
              >
                <img src={member.image} alt={member.name} className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="p-5">
                  <h3 className="font-display text-2xl text-beige">{member.name}</h3>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-gold">{member.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">{member.bio}</p>
                  <a href="#" className="mt-4 inline-block text-sm font-semibold text-gold transition hover:text-beige">
                    View Profile
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
