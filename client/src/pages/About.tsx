import PageLayout from "../components/PageLayout";

const About = () => {
  return (
    <PageLayout
      title="About Byte Odyssey"
      subtitle="Every Huge Leap Starts with a Small Step"
      backgroundImage="/static/img/computer.jpg"
    >
      {/* Main Content */}
      <main className="mb-4">
        <div className="container px-4 px-lg-5 mb-5">
          <div className="row gx-4 gx-lg-5 justify-content-center">
            <div className="col-md-10 col-lg-8 col-xl-7">
              {/* Introduction */}
              <div className="mb-5">
                <h1>Welcome to the Odyssey</h1>
                <p>
                  Byte Odyssey is more than just a tech blog; it is a living
                  document of my journey as a developer. Designed as a bridge
                  between complex technical concepts and personal storytelling,
                  this platform is where I share not just the "how" of coding,
                  but the "why" behind the architecture.
                </p>
                <p>
                  Here, you'll find a blend of deep technical dives, career
                  reflections, and the occasional philosophical musing on the
                  state of modern software engineering.
                </p>
              </div>

              {/* Technical Evolution Section */}
              <div className="mb-5">
                <h2>The Tech Behind the Blog</h2>
                <p>
                  This project itself is a testament to the principle of
                  continuous improvement. What started as a simple server-side
                  rendered application has evolved into a modern, full-stack
                  ecosystem:
                </p>
                <ul className="list-unstyled ms-2">
                  <li className="mb-3">
                    <strong>Phase 1: The Beginning.</strong> Originally built
                    with <em>Python Flask</em> and <em>Jinja2</em>, the initial
                    version taught me the fundamentals of backend logic and
                    database management.
                  </li>
                  <li className="mb-3">
                    <strong>Phase 2: The Separation.</strong> As the need for
                    better interactivity grew, I decoupled the architecture,
                    moving to a RESTful API design with <em>Express.js</em> and
                    a <em>React</em> SPA frontend.
                  </li>
                  <li>
                    <strong>Phase 3: The Modern Era (Current).</strong> Today,
                    Byte Odyssey is powered by
                    <strong> React 19, TypeScript, and Vite</strong>. This
                    latest iteration focuses on type safety, developer
                    experience, and lightning-fast performance, backed by a
                    robust <strong>MongoDB</strong> database.
                  </li>
                </ul>
              </div>

              {/* Closing / Features */}
              <div className="mb-5">
                <h2>Built for Creators</h2>
                <p>
                  Beyond the stack, I've poured effort into the user experience.
                  With features like a custom rich-text editor, real-time
                  validation, and secure JWT authentication, this blog showcases
                  how modern tools can be leveraged to build products that are
                  both functional and aesthetic.
                </p>
                <p>
                  I hope this blog inspires you to explore the intersection of
                  technology and creativity. Whether you're a fellow developer
                  or just curious about the world of code, I look forward to
                  sharing this journey with you!
                </p>
              </div>

              {/* GitHub Link Section */}
              <div className="text-center mt-5">
                <hr className="my-4" />
                <p className="text-muted fst-italic mb-3">
                  Interested in the code? Check out the source on GitHub.
                </p>
                <a
                  href="https://github.com/lhq5520/Blog-React"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-dark text-uppercase"
                >
                  <i className="fab fa-github me-2"></i> View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  );
};

export default About;
